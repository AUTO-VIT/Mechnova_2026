// src/components/Footer.jsx
import React from 'react';
import { Cpu, Terminal, Radio, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black border-t-2 border-zinc-900 text-zinc-500 py-10 font-mono text-xs mt-auto relative overflow-hidden">
      {/* Warning Stripe Line at top of Footer */}
      <div className="absolute top-0 left-0 right-0 h-1 warning-stripes opacity-70"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 text-white font-extrabold text-lg mb-3">
            <Cpu className="w-5 h-5 text-red-600" />
            <span>AUTO<span className="text-red-600">//</span>HACK</span>
          </div>
          <p className="text-zinc-400 text-xs font-sans leading-relaxed mb-4">
            Industrial cyber-physical automation hackathon portal. Built for real-time telemetry, anti-cheat speed quiz competition, and deterministic theme allocation.
          </p>
          <div className="flex items-center space-x-2 text-red-500 text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>ENCRYPTED SCADA CHANNEL</span>
          </div>
        </div>

        <div>
          <h4 className="text-zinc-200 font-bold uppercase tracking-wider mb-3 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-red-500" />
            <span>TELEMETRY METRICS</span>
          </h4>
          <ul className="space-y-1.5 text-zinc-400">
            <li>SYSTEM STATUS: <span className="text-emerald-400">NOMINAL</span></li>
            <li>FIRESTORE SYNC: <span className="text-emerald-400">ACTIVE</span></li>
            <li>SECURITY PROTOCOL: <span className="text-red-400">AIR-GAPPED VAULT</span></li>
            <li>QUIZ ENGINE: <span className="text-amber-400">10s+10s DUAL-PHASE</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-zinc-200 font-bold uppercase tracking-wider mb-3 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-red-500" />
            <span>SYSTEM NODES</span>
          </h4>
          <ul className="space-y-1.5 text-zinc-400">
            <li>NODE_01: <span className="text-zinc-300">QUIZ_SUBMISSIONS_CLUSTER</span></li>
            <li>NODE_02: <span className="text-zinc-300">BIDDING_PRIORITY_GATEWAY</span></li>
            <li>NODE_03: <span className="text-zinc-300">THEME_VAULT_ENCRYPTION</span></li>
            <li>NODE_04: <span className="text-zinc-300">ALLOCATION_ENGINE_V2</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-zinc-200 font-bold uppercase tracking-wider mb-3">COMMAND MATRIX</h4>
          <div className="p-3 bg-zinc-950 border border-zinc-800 text-[11px]">
            <div className="text-zinc-300 font-bold mb-1">AUTOMATION HACKATHON 2026</div>
            <div className="text-zinc-500">© 2026 Industrial Cybernetic Operations. All Rights Reserved.</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center text-[10px] text-zinc-600">
        <div>SYS_TIME: {new Date().toISOString()}</div>
        <div className="mt-2 sm:mt-0">CYBER-PHYSICAL AUTOMATION ENGINE v2.6.4</div>
      </div>
    </footer>
  );
};
