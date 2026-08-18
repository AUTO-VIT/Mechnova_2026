// src/pages/FAQ.jsx
import React, { useState } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { HelpCircle, ChevronDown, Terminal, Shield } from 'lucide-react';

export const FAQ = () => {
  const { siteContent } = useGlobalConfig();
  const faqItems = siteContent?.faq?.items || [];
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-red-600 text-black font-mono text-[10px] font-bold px-3 py-0.5 uppercase tracking-widest">
          FAQ_MODULE
        </div>

        <div className="flex items-center space-x-3 text-red-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>KNOWLEDGE BASE & PROTOCOL DIRECTIVES</span>
        </div>

        <h1 className="font-mono text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="text-zinc-400 font-sans text-sm mt-2">
          Everything you need to know about the 10s+10s dual-phase quiz, priority bidding, and theme allocation logic.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4 font-mono">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`border transition-all ${
                isOpen 
                  ? 'bg-zinc-950 border-red-600/60 shadow-[0_0_15px_rgba(220,38,38,0.15)]' 
                  : 'bg-black border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <button
                onClick={() => toggleItem(idx)}
                className="w-full p-5 text-left flex items-center justify-between space-x-4 focus:outline-none"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-red-500 font-bold text-xs">Q{String(idx + 1).padStart(2, '0')}</span>
                  <span className="font-bold text-white text-sm sm:text-base">{item.question}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-red-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-zinc-900 text-zinc-300 font-sans text-sm leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Box */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <div className="font-mono text-sm font-bold text-white uppercase">NEED TECHNICAL SCADA ASSISTANCE?</div>
            <div className="text-xs font-sans text-zinc-400">Reach out to the Hackathon Control Room desk anytime during the event.</div>
          </div>
        </div>
        <div className="font-mono text-xs text-red-400 bg-red-950/60 border border-red-800 px-3 py-1.5 uppercase">
          CONTROL_ROOM: ONLINE
        </div>
      </div>
    </div>
  );
};
