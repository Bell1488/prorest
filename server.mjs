import http from 'node:http';
import https from 'node:https';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SocksProxyAgent } from 'socks-proxy-agent';

const root = fileURLToPath(new URL('.', import.meta.url));
const dist = join(root, 'dist');
const port = Number(process.env.PORT || 8787);
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const proxyUrl = process.env.SOCKS5H_PROXY;
const telegramAgent = proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined;
const rateLimit = new Map();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

function clean(value, max = 500) {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max) : '';
}

function validateLead(body) {
  const name = clean(body.name, 100);
  const phone = clean(body.phone, 40);
  const contactId = clean(body.contactId, 120);
  if (!name || !phone || !contactId || body.consent !== true) return { error: 'Заполните обязательные поля и подтвердите согласие' };
  if (!/^[+\d()\s-]{7,40}$/.test(phone)) return { error: 'Проверьте номер телефона' };
  if (!['telegram', 'max'].includes(body.contactMethod)) return { error: 'Выберите способ связи' };
  if (clean(body.website)) return { error: 'Некорректная заявка' };
  return { name, phone, contactId, contactMethod: body.contactMethod };
}

function formatMessage(body, lead, ip) {
  const lines = [
    'Новая заявка с сайта ProRest',
    '',
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Связь: ${lead.contactMethod === 'telegram' ? 'Telegram' : 'MAX'} — ${lead.contactId}`,
  ];
  if (body.amount) lines.push(`Сумма: ${clean(body.amount, 40)} CNY`);
  if (body.paymentMethod) lines.push(`Способ оплаты: ${clean(body.paymentMethod, 100)}`);
  if (body.exchange && typeof body.exchange === 'object') {
    const exchange = body.exchange;
    lines.push('', 'Расчет:', `Отдаю: ${clean(String(exchange.fromAmount), 40)} ${clean(String(exchange.fromCurrency), 10)}`,
      `Получаю: ${clean(String(exchange.toAmount), 40)} ${clean(String(exchange.toCurrency), 10)}`,
      `Курс: 1 ${clean(String(exchange.fromCurrency), 10)} = ${clean(String(exchange.rate), 40)} ${clean(String(exchange.toCurrency), 10)}`,
      `Способ: ${clean(String(exchange.method), 100)}`,
      `Комиссия: ${clean(String(exchange.commissionPercent), 20)}%`);
  }
  const attribution = body.attribution && typeof body.attribution === 'object' ? body.attribution : {};
  const source = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid']
    .filter((key) => attribution[key])
    .map((key) => `${key}=${clean(String(attribution[key]), 200)}`)
    .join(', ');
  if (source) lines.push('', `Реклама: ${source}`);
  lines.push('', `IP: ${ip}`);
  return lines.join('\n');
}

function sendTelegram(text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true });
    const request = https.request({
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${encodeURIComponent(botToken)}/sendMessage`,
      method: 'POST',
      agent: telegramAgent,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 15000,
    }, (response) => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) resolve();
        else reject(new Error(`Telegram API ${response.statusCode}: ${data.slice(0, 200)}`));
      });
    });
    request.on('timeout', () => request.destroy(new Error('Telegram request timed out')));
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

async function readBody(req) {
  let size = 0;
  let raw = '';
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 32 * 1024) throw new Error('Payload too large');
    raw += chunk;
  }
  return JSON.parse(raw || '{}');
}

async function serveStatic(req, res) {
  const requested = req.url === '/' ? '/index.html' : new URL(req.url, 'http://localhost').pathname;
  const safePath = normalize(requested).replace(/^([.][.][\\/])+/, '');
  let filePath = join(dist, safePath);
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    filePath = join(dist, 'index.html');
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/api/leads') {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const recent = (rateLimit.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
    if (recent.length >= 8) return json(res, 429, { error: 'Слишком много заявок. Попробуйте позже.' });
    recent.push(now);
    rateLimit.set(ip, recent);
    if (!botToken || !chatId) return json(res, 503, { error: 'Сервис заявок не настроен' });
    try {
      const body = await readBody(req);
      const lead = validateLead(body);
      if (lead.error) return json(res, 400, lead);
      await sendTelegram(formatMessage(body, lead, ip));
      return json(res, 200, { ok: true });
    } catch (error) {
      console.error(error);
      return json(res, 500, { error: 'Не удалось отправить заявку' });
    }
  }

  return serveStatic(req, res);
});

server.listen(port, () => {
  if (!botToken || !chatId) console.warn('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are not configured');
  console.log(`ProRest server listening on :${port}${proxyUrl ? ' via SOCKS5H' : ''}`);
});
