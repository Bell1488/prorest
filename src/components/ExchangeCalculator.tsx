import { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowRight, ArrowLeftRight, Info, TrendingUp, Zap, Send, UserRound } from 'lucide-react';
import {
  type Currency,
  type RateTable,
  CURRENCY_SYMBOLS,
  RATES,
  getRate,
  formatNumber,
} from '@/types';
import { trackGoal } from '@/lib/analytics';
import { TELEGRAM_URL } from '@/lib/contacts';

const CURRENCIES: Currency[] = ['RUB', 'CNY', 'USD'];

export function ExchangeCalculator() {
  const [fromCurrency, setFromCurrency] = useState<Currency>('RUB');
  const [toCurrency, setToCurrency] = useState<Currency>('CNY');
  const [fromAmount, setFromAmount] = useState<string>('50000');
  const [method, setMethod] = useState<string>('invoice');
  const [rates, setRates] = useState<RateTable>(RATES);
  const [officialRubRates, setOfficialRubRates] = useState<RateTable | null>(null);
  const [rateUpdatedAt, setRateUpdatedAt] = useState<string | null>(null);
  const [rateStatus, setRateStatus] = useState<'loading' | 'live' | 'fallback'>('loading');

  useEffect(() => {
    let active = true;

    const loadRates = async () => {
      try {
        const response = await fetch('/api/rates', { cache: 'no-store' });
        if (!response.ok) throw new Error('Rates API unavailable');
        const data = await response.json() as { rates?: RateTable; officialRubRates?: RateTable; updatedAt?: string };
        if (!data.rates || !active) return;
        setRates(data.rates);
        setOfficialRubRates(data.officialRubRates || null);
        setRateUpdatedAt(data.updatedAt || null);
        setRateStatus('live');
      } catch {
        if (active) setRateStatus('fallback');
      }
    };

    void loadRates();
    const timer = window.setInterval(loadRates, 60 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const rate = useMemo(() => getRate(fromCurrency, toCurrency, rates), [fromCurrency, toCurrency, rates]);
  const officialRate = useMemo(() => {
    if (!officialRubRates) return null;
    const from = officialRubRates[fromCurrency];
    const to = officialRubRates[toCurrency];
    return from && to ? from / to : null;
  }, [fromCurrency, toCurrency, officialRubRates]);

  const calculated = useMemo(() => {
    const amount = parseFloat(fromAmount) || 0;
    const baseResult = amount * rate;
    const commissionPercent =
      method === 'invoice' ? 1.5 :
      method === 'alipay' ? 1.8 :
      method === 'wechat' ? 1.6 : 2.0;
    const commissionAmount = baseResult * (commissionPercent / 100);
    const toAmount = baseResult - commissionAmount;
    return { toAmount, commissionPercent, commissionAmount, total: baseResult };
  }, [fromAmount, rate, method]);

  const handleCalculate = useCallback(() => {
    const amount = parseFloat(fromAmount) || 0;
    if (amount <= 0) return;
    trackGoal('calculator_submit', { fromCurrency, toCurrency, method });
  }, [fromAmount, fromCurrency, toCurrency, method]);

  return (
    <div id="calculator" className="relative py-10 sm:py-14 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <div className="calc-card rounded-3xl p-6 sm:p-8 animate-scale-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0052CC]">
              <TrendingUp className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Калькулятор обмена</h2>
              <p className="text-sm text-gray-400">Рассчитайте платёж за секунду</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-2 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Отдаю</label>
              <div className="relative">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0"
                  className="input-field w-full pl-4 pr-16 py-4 rounded-xl text-2xl font-bold text-gray-900"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <CurrencySelector value={fromCurrency} onChange={setFromCurrency} />
                </div>
              </div>
            </div>

            <button
              onClick={swapCurrencies}
              className="self-end mb-1 w-11 h-11 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0052CC] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Поменять валюты"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Получаю</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={formatNumber(calculated.toAmount)}
                  className="input-field w-full pl-4 pr-16 py-4 rounded-xl text-2xl font-bold text-[#0052CC] bg-blue-50/30"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <CurrencySelector value={toCurrency} onChange={setToCurrency} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl text-sm">
            <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500">
              Курс: <span className="font-semibold text-gray-700">1 {fromCurrency} = {formatNumber(rate)} {toCurrency}</span>
            </span>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-gray-500">
              Комиссия: <span className="font-semibold text-gray-700">{calculated.commissionPercent}%</span>
            </span>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-gray-500">
              К доплате: <span className="font-semibold text-gray-700">{CURRENCY_SYMBOLS[fromCurrency]}{formatNumber(calculated.commissionAmount)}</span>
            </span>
          </div>

          <p className={`mt-2 text-xs ${rateStatus === 'live' ? 'text-green-600' : 'text-gray-400'}`}>
            {rateStatus === 'live' && rateUpdatedAt
              ? `Текущий курс ЦБ РФ. Обновлен ${new Date(rateUpdatedAt).toLocaleString('ru-RU')}`
              : rateStatus === 'loading'
                ? 'Загружаем актуальный курс ЦБ РФ…'
                : 'Курс ЦБ РФ временно недоступен. Используется резервный курс для предварительного расчета.'}
          </p>
          {officialRate && fromCurrency === 'RUB' && toCurrency === 'CNY' && (
            <p className="mt-1 text-xs text-gray-500">
              Курс ЦБ РФ: 1 RUB = {formatNumber(officialRate)} CNY · Курс покупки юаней: 1 RUB = {formatNumber(rate)} CNY
            </p>
          )}

          <div className="mt-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Способ оплаты</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'invoice', label: 'Инвойс' },
                { key: 'alipay', label: 'Alipay' },
                { key: 'wechat', label: 'WeChat' },
                { key: 'card', label: 'Карта' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    method === m.key
                      ? 'btn-gradient text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full mt-6 px-7 py-4 text-base font-semibold text-white btn-gradient rounded-xl flex items-center justify-center gap-2.5 group"
          >
            <Zap className="w-5 h-5" />
            Рассчитать платёж
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Предварительный расчёт. Финальные условия подтвердит менеджер после проверки реквизитов.
          </p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <a href={`${TELEGRAM_URL}?text=${encodeURIComponent(`Здравствуйте! Расчёт: ${formatNumber(parseFloat(fromAmount) || 0)} ${fromCurrency} → ${formatNumber(calculated.toAmount)} ${toCurrency}, курс ${formatNumber(rate)}, комиссия ${calculated.commissionPercent}%`)}`} target="_blank" rel="noopener noreferrer" onClick={() => trackGoal('telegram_click', { source: 'calculator' })} className="px-4 py-3 rounded-xl text-sm font-semibold text-white btn-gradient flex items-center justify-center gap-2"><Send className="w-4 h-4" />Зафиксировать курс в Telegram</a>
            <button type="button" onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })} className="px-4 py-3 rounded-xl text-sm font-semibold text-[#0052CC] bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-2"><UserRound className="w-4 h-4" />Оставить контакт</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrencySelector({ value, onChange }: { value: Currency; onChange: (c: Currency) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Currency)}
      className="appearance-none bg-white border-2 border-gray-200 rounded-lg pl-2.5 pr-1 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-[#0052CC] cursor-pointer"
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
