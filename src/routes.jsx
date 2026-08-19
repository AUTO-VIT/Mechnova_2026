import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AutomationShell } from './components/common/AutomationShell';

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
  return <div className="page-loader" role="status" aria-live="polite">Loading workspace…</div>;
}

export function AppRoutes() {
  return (
    <AutomationShell>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/status" element={<EventStatus />} />
        <Route path="/themes" element={<ThemeRevealPanel />} />
        <Route path="/register" element={<RegistrationPage />} />
        
        {/* Participant Pages */}
        <Route path="/login" element={<TeamAccessGate />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/bidding" element={<BiddingPage />} />
        <Route path="/results" element={<ResultsPage />} />

        {/* Admin Pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AutomationShell>
  );
}
