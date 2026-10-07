export type Currency = 'RUB' | 'CNY' | 'USD';

export interface ExchangeData {
  fromAmount: number;
  fromCurrency: Currency;
  toAmount: number;
  toCurrency: Currency;
  rate: number;
  commissionPercent: number;
  commissionAmount: number;
  total: number;
  method: string;
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  RUB: '₽ Рубли',
  CNY: '¥ Юани',
  USD: '$ Доллары',
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  RUB: '₽',
  CNY: '¥',
  USD: '$',
};

// Approximate reference rates (1 unit from → to units)
export const RATES: Record<string, number> = {
  // Fallback customer rates: approximately 1% less favorable than the reference rates above.
  RUB_CNY: 0.072765,
  CNY_RUB: 13.464,
  USD_CNY: 7.25,
  CNY_USD: 0.138,
  RUB_USD: 0.0104,
  USD_RUB: 96.20,
};

export type RateTable = Record<string, number>;

export const COMMISSIONS: Record<string, number> = {
  invoice: 1.5,
  alipay: 1.8,
  wechat: 1.6,
  card: 2.0,
};

export const METHOD_LABELS: Record<string, string> = {
  invoice: 'Поставщику по инвойсу',
  alipay: 'Alipay',
  wechat: 'WeChat Pay',
  card: 'Китайская карта',
};

export function getRate(from: Currency, to: Currency, rates: RateTable = RATES): number {
  if (from === to) return 1;
  return rates[`${from}_${to}`] ?? 1;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
