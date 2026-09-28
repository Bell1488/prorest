import { useState } from 'react';
import { ArrowRight, Building2, FileText, MapPin, MessageSquare, Send, User, Phone } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { sendLead } from '@/lib/leads';
import { trackGoal } from '@/lib/analytics';

type ContactMethod = 'telegram' | 'max';

export function Contact() {
  const ref = useReveal<HTMLDivElement>();
  const [contactMethod, setContactMethod] = useState<ContactMethod>('telegram');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Поставщику по инвойсу');
  const [contactId, setContactId] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await sendLead({ name, phone, amount, paymentMethod, contactMethod, contactId, consent });
      trackGoal('lead_submit', { source: 'contact' });
      setStatus('success');
      setName('');
      setPhone('');
      setAmount('');
      setContactId('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-gradient-to-b from-blue-50/30 to-white scroll-mt-20">
      <div ref={ref} className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="reveal text-center mb-12">
          <p className="text-sm font-semibold text-[#0052CC] uppercase tracking-wider mb-3">Контакты</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Остался один шаг.
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Оставьте вводные — обсудим курс, рассчитаем итог в рублях и согласуем следующий шаг. Работаем с наличными в Москве и Санкт-Петербурге.
          </p>
        </div>

        <div className="reveal glass-card rounded-2xl p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ваше имя</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Как вас зовут" className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Номер телефона</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+7 999 123-45-67" className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Сумма в юанях (CNY)</label>
              <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Например, 50 000" className="input-field w-full px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Способ оплаты</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field w-full px-4 py-3 rounded-xl text-gray-900">
                <option>Поставщику по инвойсу</option>
                <option>Alipay</option>
                <option>WeChat Pay</option>
                <option>Китайская карта</option>
                <option>Наличные в Москве / Санкт-Петербурге</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Способ связи</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setContactMethod('telegram')}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    contactMethod === 'telegram' ? 'btn-gradient text-white shadow-md' : 'input-field text-gray-600'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Telegram
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod('max')}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    contactMethod === 'max' ? 'btn-gradient text-white shadow-md' : 'input-field text-gray-600'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  MAX
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {contactMethod === 'telegram' ? 'Ваш Telegram' : 'Ваш ID в MAX'}
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" required value={contactId} onChange={(e) => setContactId(e.target.value)} placeholder={contactMethod === 'telegram' ? '@username' : 'ID или номер в MAX'} className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm" />
              </div>
            </div>
            <div className="sm:col-span-2 mt-2">
              <label className="flex items-start gap-2 text-xs text-gray-500 mb-4">
                <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#0052CC]" />
                <span>Соглашаюсь на обработку персональных данных согласно <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-[#0052CC] underline">политике конфиденциальности</a>.</span>
              </label>
              <button type="submit" disabled={status === 'sending'} className="w-full px-7 py-4 text-base font-semibold text-white btn-gradient rounded-xl flex items-center justify-center gap-2.5 group disabled:opacity-60">
                Отправить заявку менеджеру
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <p role="status" className={`text-center text-xs mt-3 ${status === 'error' ? 'text-red-500' : status === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                {status === 'sending' ? 'Отправляем заявку…' : status === 'success' ? 'Заявка отправлена. Менеджер свяжется с вами.' : status === 'error' ? 'Не удалось отправить заявку. Попробуйте еще раз.' : 'Заявка отправится менеджеру через защищённый канал связи.'}
              </p>
            </div>
          </form>
        </div>

        <div className="reveal grid sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0052CC] flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Компания</p>
              <p className="text-sm font-semibold text-gray-900">ООО «ПРОРЕСТ»</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0052CC] flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Реквизиты</p>
              <p className="text-sm font-semibold text-gray-900">ИНН 9100001519 · ОГРН 1269100005228</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0052CC] flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Юридический адрес</p>
              <p className="text-sm font-semibold text-gray-900">г. Симферополь, ул. Камская, д. 29, кв. 10</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
