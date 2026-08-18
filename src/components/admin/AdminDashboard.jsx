import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { EventControls } from './EventControls';
import { QuizQuestionEditor } from './QuizQuestionEditor';
import { ThemeControl } from './ThemeControl';
import { AllocationConsole } from './AllocationConsole';
import { CmsEditor } from './CmsEditor';
import { AuditLogTable } from './AuditLogTable';
import { Shield, Sliders, HelpCircle, Eye, Award, FileText, Terminal } from 'lucide-react';

export function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { eventData } = useEvent();
  const [activeTab, setActiveTab] = useState('controls');

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center font-mono">
        <div className="border border-red-600 bg-zinc-950 p-8 space-y-4">
          <div className="text-red-500 font-extrabold text-lg">ACCESS DENIED</div>
          <p className="text-xs text-zinc-400">
            Administrator privileges required. Please sign in at the Admin Login Gate.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'controls', label: 'OPERATIONAL CONTROLS', icon: Sliders },
    { id: 'quiz', label: 'QUIZ QUESTION BANK', icon: HelpCircle },
    { id: 'themes', label: 'THEME VAULT & REVEAL', icon: Eye },
    { id: 'allocation', label: 'PRIORITY BIDDING & RANK', icon: Award },
    { id: 'cms', label: 'CMS CONTENT', icon: FileText },
    { id: 'audit', label: 'AUDIT LEDGER', icon: Terminal }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="border border-red-600/50 bg-zinc-950 p-6 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_30px_rgba(220,38,38,0.15)]">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            <h1 className="font-mono text-xl font-black uppercase tracking-wider text-white">
              AUTOMATION MISSION CONTROL // ADMINISTRATOR CONSOLE
            </h1>
          </div>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Superuser authorization active &bull; Privileged operations engine
          </p>
        </div>

        <StatusBadge status="ADMINISTRATOR ACTIVE" variant="red" />
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase transition-all duration-160 active:scale-[0.97] ${
                isActive
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                  : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Module Viewport */}
      <div>
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
