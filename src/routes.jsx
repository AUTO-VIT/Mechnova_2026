import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AutomationShell } from './components/common/AutomationShell';
import { DataLoadingPanel } from './components/common/DataLoadingPanel';
import { useEvent } from './context/EventContext';

const loadComponent = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));
const HomePage = loadComponent(() => import('./components/public/HomePage'), 'HomePage');
const EventStatus = loadComponent(() => import('./components/public/EventStatus'), 'EventStatus');
const ThemeRevealPanel = loadComponent(() => import('./components/public/ThemeRevealPanel'), 'ThemeRevealPanel');
const RegistrationPage = loadComponent(() => import('./components/public/RegistrationPage'), 'RegistrationPage');
const TeamAccessGate = loadComponent(() => import('./components/participant/TeamAccessGate'), 'TeamAccessGate');
const QuizPage = loadComponent(() => import('./components/participant/QuizPage'), 'QuizPage');
const BiddingPage = loadComponent(() => import('./components/participant/BiddingPage'), 'BiddingPage');
const ResultsPage = loadComponent(() => import('./components/participant/ResultsPage'), 'ResultsPage');
const AdminLogin = loadComponent(() => import('./components/admin/AdminLogin'), 'AdminLogin');
const AdminDashboard = loadComponent(() => import('./components/admin/AdminDashboard'), 'AdminDashboard');

function PageLoader() {
  return <div className="mn-empty min-h-60" role="status" aria-live="polite">Loading page…</div>;
}

function EventDataGate({ children }) {
  const { loading, loadFailed } = useEvent();

  if (loading) return <DataLoadingPanel label="Loading current event data…" className="mx-auto max-w-3xl" />;
  if (loadFailed) {
    return (
      <div className="mn-empty mx-auto min-h-60 max-w-3xl" role="alert">
        <div><h1 className="text-xl font-semibold">Event data is temporarily unavailable.</h1><p className="mt-2 text-sm text-[var(--mn-muted)]">Refresh the page to try again.</p></div>
      </div>
    );
  }

  return children;
}

export function AppRoutes() {
  return (
    <AutomationShell>
      <Suspense fallback={<PageLoader />}>
        <EventDataGate>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/status" element={<EventStatus />} />
            <Route path="/themes" element={<ThemeRevealPanel />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/login" element={<TeamAccessGate />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/bidding" element={<BiddingPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EventDataGate>
      </Suspense>
    </AutomationShell>
  );
}
