import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { EventControls } from './EventControls';
import { QuizQuestionEditor } from './QuizQuestionEditor';
import { ThemeControl } from './ThemeControl';
import { AllocationConsole } from './AllocationConsole';
import { CmsEditor } from './CmsEditor';
import { AuditLogTable } from './AuditLogTable';
import { Shield, Sliders, HelpCircle, Eye, Award, FileText, Terminal, Lock } from 'lucide-react';

export function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { eventData } = useEvent();
  const [activeTab, setActiveTab] = useState('controls');

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center space-y-4">
        <div className="h-14 w-14 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto text-red-400">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="font-display text-3xl font-extrabold text-white">
          Admin Access Required
        </h2>
        <p className="text-zinc-400 text-sm font-light">
          You must be authenticated with administrative privileges to view this portal.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'controls', label: 'Operational Controls', icon: Sliders },
    { id: 'quiz', label: 'Quiz Question Bank', icon: HelpCircle },
    { id: 'themes', label: 'Theme Vault & Reveal', icon: Eye },
    { id: 'allocation', label: 'Bidding & Allocation Rank', icon: Award },
    { id: 'cms', label: 'CMS Content Editor', icon: FileText },
    { id: 'audit', label: 'Audit Log Ledger', icon: Terminal }
  ];

  return (
    <div className="w-full space-y-10">
      {/* Header across 1080p */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-red-500 font-mono text-xs tracking-widest uppercase">
            <Shield className="h-3.5 w-3.5" />
            <span>ADMINISTRATIVE MISSION CONTROL</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            Admin Command
          </h1>
          <p className="text-zinc-400 font-sans text-base max-w-3xl font-light">
            Authoritative event management, question bank authoring, audited theme reveals, and deterministic priority allocation finalization.
          </p>
        </div>

        <div className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/10 rounded-full px-4 py-2 font-bold uppercase tracking-wider">
          SUPERUSER PRIVILEGES ACTIVE
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.08] pb-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-5 py-3 rounded-full transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Viewport */}
      <div className="pt-2">
        {activeTab === 'controls' && <EventControls eventData={eventData} />}
        {activeTab === 'quiz' && <QuizQuestionEditor quizId={eventData?.quizId || 'default-quiz'} />}
        {activeTab === 'themes' && <ThemeControl eventData={eventData} />}
        {activeTab === 'allocation' && <AllocationConsole eventData={eventData} />}
        {activeTab === 'cms' && <CmsEditor eventData={eventData} />}
        {activeTab === 'audit' && <AuditLogTable eventData={eventData} />}
      </div>
    </div>
  );
}
