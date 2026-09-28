import { Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A1A35] py-12">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl btn-gradient flex items-center justify-center text-white">
              <Globe className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-base font-bold text-white">Pro<span className="text-blue-400">Rest</span></p>
              <p className="text-xs text-gray-400">ООО «ПРОРЕСТ»</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <button onClick={() => document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-gray-400 hover:text-white transition-colors">Калькулятор</button>
            <button onClick={() => document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-gray-400 hover:text-white transition-colors">Услуги</button>
            <button onClick={() => document.querySelector('#process')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-gray-400 hover:text-white transition-colors">Процесс</button>
            <button onClick={() => document.querySelector('#faq')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</button>
            <button onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-gray-400 hover:text-white transition-colors">Контакты</button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Платёжное сопровождение, наличные в Москве и Санкт-Петербурге, организация поставок между Китаем и Россией. © {new Date().getFullYear()} ООО «ПРОРЕСТ»
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Информация на сайте не является публичной офертой.
          </p>
        </div>
      </div>
    </footer>
  );
}
