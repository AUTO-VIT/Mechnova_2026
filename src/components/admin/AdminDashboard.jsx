import React, { useState } from 'react';
import { Award, Eye, FileText, HelpCircle, History, LayoutDashboard, Lock, Settings2, Shield, UsersRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { AllocationConsole } from './AllocationConsole';
import { AuditLogTable } from './AuditLogTable';
import { CmsEditor } from './CmsEditor';
import { EventControls } from './EventControls';
import { QuizQuestionEditor } from './QuizQuestionEditor';
import { RegistrationConsole } from './RegistrationConsole';
import { ThemeControl } from './ThemeControl';

const tabs = [
  { id: 'controls', label: 'Event controls', description: 'Open and close live phases', icon: Settings2 },
  { id: 'quiz', label: 'Quiz questions', description: 'Prepare the question bank', icon: HelpCircle },
  { id: 'themes', label: 'Themes & seats', description: 'Edit and reveal themes', icon: Eye },
  { id: 'registrations', label: 'Registrations', description: 'Review teams and exports', icon: UsersRound },
  { id: 'allocation', label: 'Allocation', description: 'Review bids and publish results', icon: Award },
  { id: 'cms', label: 'Homepage content', description: 'Edit public page copy', icon: FileText },
  { id: 'audit', label: 'Activity history', description: 'Review administrative changes', icon: History }
];

export function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { eventData } = useEvent();
  const [activeTab, setActiveTab] = useState('controls');

  if (!isAdmin) {
    return (
      <div className="mn-empty mx-auto max-w-2xl">
        <div className="max-w-md"><Lock className="mn-empty-icon p-3" /><span className="mn-kicker justify-center">Restricted</span><h1 className="mt-5 font-['Syne'] text-4xl font-semibold tracking-tight">Administrator access required.</h1><p className="mt-4 text-sm leading-6 text-[var(--mn-muted)]">Sign in with an authorized administrator account to manage the event.</p><a href="/admin/login" className="mn-button mn-button-primary mt-7">Admin sign in</a></div>
      </div>
    );
  }

  const renderActivePanel = () => {
    if (activeTab === 'controls') return <EventControls eventData={eventData} />;
    if (activeTab === 'quiz') return <QuizQuestionEditor quizId={eventData?.quizId || 'default-quiz'} />;
    if (activeTab === 'themes') return <ThemeControl eventData={eventData} />;
    if (activeTab === 'registrations') return <RegistrationConsole eventData={eventData} />;
    if (activeTab === 'allocation') return <AllocationConsole eventData={eventData} />;
    if (activeTab === 'cms') return <CmsEditor eventData={eventData} />;
    return <AuditLogTable eventData={eventData} />;
  };

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="space-y-10">
      <header className="mn-admin-hero flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
        <div className="max-w-4xl"><span className="mn-kicker"><Shield className="h-3.5 w-3.5" /> Event administration</span><h1 className="mt-4 mn-title">MechNova control room.</h1><p className="mt-5 mn-lede">Manage registrations, event phases, hidden themes, team allocation, results, and public content from one place.</p></div>
        <div className="mn-panel-soft flex items-center gap-3 p-3.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#d79df1] to-[#69358f] text-white shadow-[0_0_22px_rgba(215,157,241,.28)]"><LayoutDashboard className="h-4 w-4" /></span><div><span className="mn-label">Current event</span><strong className="mt-0.5 block text-sm font-medium">{eventData?.name || 'MechNova 2026'}</strong></div></div>
      </header>

      <div className="mn-admin-layout">
        <nav className="mn-admin-nav" aria-label="Admin sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`mn-admin-tab ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}><Icon className="h-4 w-4 shrink-0" /><span><strong className="block font-medium">{tab.label}</strong><small className="mt-0.5 hidden text-[10px] text-[var(--mn-faint)] xl:block">{tab.description}</small></span></button>;
          })}
        </nav>

        <main className="mn-admin-content">
          <div className="mb-5 flex items-end justify-between gap-4"><div><span className="mn-label">Workspace</span><h2 className="mt-2 font-['Syne'] text-2xl font-semibold">{currentTab?.label}</h2></div><span className="mn-status is-live"><span className="mn-live-dot" /> Saved to Firebase</span></div>
          {renderActivePanel()}
        </main>
      </div>
    </div>
  );
}
