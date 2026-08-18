// src/pages/Schedule.jsx
import React from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { Calendar, Clock, ChevronRight, Terminal } from 'lucide-react';

export const Schedule = () => {
  const { siteContent } = useGlobalConfig();
  const timelineEvents = siteContent?.schedule?.timelineEvents || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-red-600 text-black font-mono text-[10px] font-bold px-3 py-0.5 uppercase tracking-widest">
          TIMELINE_MODULE
        </div>

        <div className="flex items-center space-x-3 text-red-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
          <Calendar className="w-4 h-4" />
          <span>OFFICIAL EVENT TIMELINE & SEQUENCE</span>
        </div>

        <h1 className="font-mono text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
          AUTOMATION HACKATHON SCHEDULE
        </h1>
        <p className="text-zinc-400 font-sans text-sm mt-2">
          Dynamic milestone tracking for registration, speed quiz, theme bidding, and 24-hour hackathon sprint.
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l-2 border-red-900/60 ml-4 sm:ml-8 space-y-8 pl-6 sm:pl-8 py-4">
        {timelineEvents.map((event, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Node LED */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-black border-2 border-red-600 group-hover:bg-red-600 transition-colors flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 hover:border-red-600/50 p-6 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center space-x-1.5 bg-red-950/60 border border-red-800/80 px-2.5 py-1 text-xs font-mono font-bold text-red-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{event.time}</span>
                </span>
                <span className="font-mono text-[11px] text-zinc-500 uppercase">MILESTONE_{String(idx + 1).padStart(2, '0')}</span>
              </div>

              <h3 className="font-mono text-lg font-bold text-white uppercase tracking-tight mb-2 flex items-center">
                <span>{event.title}</span>
                <ChevronRight className="w-4 h-4 text-red-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>

              <p className="text-zinc-400 font-sans text-sm leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
