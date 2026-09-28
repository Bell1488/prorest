import { ArrowRight, ShieldCheck, Zap, Clock, TrendingUp, type LucideIcon } from 'lucide-react';
import { ExchangeCalculator } from '@/components/ExchangeCalculator';
import type { ExchangeData } from '@/types';

interface HeroProps {
  onCalculate: (data: ExchangeData) => void;
}

export function Hero({ onCalculate }: HeroProps) {
  return (
    <section className="relative pt-28 sm:pt-36 pb-10 sm:pb-14 hero-bg overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-20 -right-32 w-[28rem] h-[28rem] bg-blue-200/25 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl animate-pulse-glow" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-blue-100 rounded-full mb-6 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
            <span className="text-xs font-semibold text-[#003D99]">Платёжное сопровождение Китай — Россия</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.08] animate-fade-up">
            Платежи в Китай.
            <br />
            <span className="text-gradient">Всё согласовано.</span> До перевода.
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto animate-fade-up delay-200">
            Оплата поставщикам, рубли → юани, пополнение Alipay и WeChat Pay.
            Работаем с наличными в Москве и Санкт-Петербурге. Рассчитайте платёж прямо сейчас — без звонков и ожидания.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center animate-fade-up delay-300">
            <button
              onClick={() => document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-7 py-4 text-base font-semibold text-white btn-gradient rounded-xl flex items-center justify-center gap-2.5 group"
            >
              <Zap className="w-5 h-5" />
              Рассчитать обмен
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-7 py-4 text-base font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:border-[#0052CC] hover:text-[#0052CC] transition-colors"
            >
              Узнать об услугах
            </button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto animate-fade-up delay-400">
            <Stat icon={TrendingUp} value="1,5%" label="Комиссия от" />
            <Stat icon={ShieldCheck} value="100%" label="Согласование до" />
            <Stat icon={Clock} value="24/7" label="Менеджер на связи" />
          </div>
        </div>
      </div>

      <ExchangeCalculator onCalculate={onCalculate} />
    </section>
  );
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="text-center">
      <Icon className="w-5 h-5 text-[#0052CC] mx-auto mb-1.5" strokeWidth={2} />
      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
