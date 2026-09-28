import { useEffect, useState } from 'react';
import { X, ArrowRight, Check, Send, TrendingUp, User, Phone, MessageSquare } from 'lucide-react';
import {
  type ExchangeData,
  CURRENCY_SYMBOLS,
  formatNumber,
  METHOD_LABELS,
} from '@/types';
import { sendLead } from '@/lib/leads';
import { trackGoal } from '@/lib/analytics';

interface ExchangeModalProps {
  data: ExchangeData | null;
  onClose: () => void;
}

type ContactMethod = 'telegram' | 'max';

export function ExchangeModal({ data, onClose }: ExchangeModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('telegram');
  const [contactId, setContactId] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (data) {
      setStatus('idle');
      setName('');
      setPhone('');
      setContactId('');
      setConsent(false);
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [data]);

  if (!data) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await sendLead({
        name,
        phone,
        contactMethod,
        contactId,
        consent,
        exchange: {
          fromAmount: data.fromAmount,
          fromCurrency: data.fromCurrency,
          toAmount: data.toAmount,
          toCurrency: data.toCurrency,
          rate: data.rate,
          commissionPercent: data.commissionPercent,
          commissionAmount: data.commissionAmount,
          method: METHOD_LABELS[data.method],
        },
      });
      trackGoal('lead_submit', { source: 'calculator', method: data.method });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[92vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-[#0052CC] to-[#003D99] px-6 py-7">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp className="w-6 h-6 text-blue-200" />
            <h3 className="text-xl font-bold text-white">Расчёт готов</h3>
          </div>
          <p className="text-blue-200 text-sm">Проверьте детали и отправьте заявку менеджеру</p>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between bg-blue-50 rounded-2xl p-5 mb-5">
            <div className="text-center flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Отдаю</p>
              <p className="text-2xl font-bold text-gray-900">{CURRENCY_SYMBOLS[data.fromCurrency]}{formatNumber(data.fromAmount)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{data.fromCurrency}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0052CC] flex-shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="text-center flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Получаю</p>
              <p className="text-2xl font-bold text-[#0052CC]">{CURRENCY_SYMBOLS[data.toCurrency]}{formatNumber(data.toAmount)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{data.toCurrency}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <DetailRow label="Способ оплаты" value={METHOD_LABELS[data.method]} />
            <DetailRow label="Курс" value={`1 ${data.fromCurrency} = ${formatNumber(data.rate)} ${data.toCurrency}`} />
            <DetailRow label="Комиссия" value={`${data.commissionPercent}% · ${CURRENCY_SYMBOLS[data.fromCurrency]}${formatNumber(data.commissionAmount)}`} />
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Итого к оплате</span>
                <span className="text-xl font-bold text-gray-900">{CURRENCY_SYMBOLS[data.fromCurrency]}{formatNumber(data.fromAmount)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ваше имя</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Как вас зовут"
                  className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Номер телефона</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 999 123-45-67"
                  className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Удобный способ связи</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setContactMethod('telegram')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    contactMethod === 'telegram'
                      ? 'btn-gradient text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Telegram
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod('max')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    contactMethod === 'max'
                      ? 'btn-gradient text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  MAX
                </button>
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  placeholder={contactMethod === 'telegram' ? '@username' : 'ID или номер в MAX'}
                  className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-gray-500">
              <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#0052CC]" />
              <span>Соглашаюсь на обработку персональных данных согласно <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-[#0052CC] underline">политике конфиденциальности</a>.</span>
            </label>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full px-6 py-4 text-base font-semibold text-white btn-gradient rounded-xl flex items-center justify-center gap-2.5 group disabled:opacity-60"
            >
              <Send className="w-5 h-5" />
              Отправить заявку менеджеру
            </button>
          </form>

          <p role="status" className={`text-center text-xs mt-3 ${status === 'error' ? 'text-red-500' : status === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
            {status === 'sending' ? 'Отправляем заявку…' : status === 'success' ? 'Заявка отправлена. Менеджер свяжется с вами.' : status === 'error' ? 'Не удалось отправить заявку. Попробуйте еще раз.' : 'Данные передаются менеджеру по защищённому каналу.'}
          </p>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-500" /> Без предоплаты</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-green-500" /> Согласование до перевода</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  );
}
