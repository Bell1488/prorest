import { readAttribution } from './analytics';

export interface LeadPayload {
  name: string;
  phone: string;
  amount?: string;
  paymentMethod?: string;
  contactMethod: 'telegram' | 'max';
  contactId: string;
  consent: boolean;
  exchange?: {
    fromAmount: number;
    fromCurrency: string;
    toAmount: number;
    toCurrency: string;
    rate: number;
    commissionPercent: number;
    commissionAmount: number;
    method: string;
  };
  website?: string;
}

export async function sendLead(payload: LeadPayload) {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, attribution: readAttribution() }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Не удалось отправить заявку');
  return result as { ok: true };
}
