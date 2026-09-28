import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Conditions } from '@/components/Conditions';
import { Process } from '@/components/Process';
import { Pricing } from '@/components/Pricing';
import { Faq } from '@/components/Faq';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { ExchangeModal } from '@/components/ExchangeModal';
import type { ExchangeData } from '@/types';

function App() {
  const [exchangeData, setExchangeData] = useState<ExchangeData | null>(null);

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <Header />
      <main>
        <Hero onCalculate={setExchangeData} />
        <Services />
        <Conditions />
        <Process />
        <Pricing />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <ExchangeModal data={exchangeData} onClose={() => setExchangeData(null)} />
    </div>
  );
}

export default App;
