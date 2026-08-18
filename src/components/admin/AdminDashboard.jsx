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
      <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
        <div className="h-12 w-12 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto text-red-400">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">
          Admin Access Required
        </h2>
        <p className="text-zinc-400 text-xs font-light">
          You must be authenticated with administrative privileges to view this portal.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'controls', label: 'Event Controls', icon: Sliders },
    { id: 'quiz', label: 'Quiz Bank', icon: HelpCircle },
    { id: 'themes', label: 'Theme Vault', icon: Eye },
    { id: 'allocation', label: 'Bidding & Rank', icon: Award },
    { id: 'cms', label: 'CMS Content', icon: FileText },
    { id: 'audit', label: 'Audit Log', icon: Terminal }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-10">
      {/* Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 text-red-500 font-mono text-xs tracking-widest uppercase">
          <Shield className="h-3.5 w-3.5" />
          <span>ADMINISTRATIVE CONSOLE</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Mission Control
        </h1>
        <p className="text-zinc-400 font-sans text-base max-w-2xl font-light">
          Authoritative event management, quiz bank curation, audited theme reveals, and allocation execution.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-4">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
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
