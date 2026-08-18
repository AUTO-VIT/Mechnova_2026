import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AutomationShell } from './components/common/AutomationShell';
import { HomePage } from './components/public/HomePage';
import { EventStatus } from './components/public/EventStatus';
import { ThemeRevealPanel } from './components/public/ThemeRevealPanel';
import { RegistrationPage } from './components/public/RegistrationPage';
import { TeamAccessGate } from './components/participant/TeamAccessGate';
import { TeamDashboard } from './components/participant/TeamDashboard';
import { QuizPage } from './components/participant/QuizPage';
import { BiddingPage } from './components/participant/BiddingPage';
import { ResultsPage } from './components/participant/ResultsPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';

export function AppRoutes() {
  return (
    <AutomationShell>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/status" element={<EventStatus />} />
        <Route path="/themes" element={<ThemeRevealPanel />} />
        <Route path="/register" element={<RegistrationPage />} />
        
        {/* Participant Pages */}
        <Route path="/login" element={<TeamAccessGate />} />
        <Route path="/dashboard" element={<TeamDashboard />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/bidding" element={<BiddingPage />} />
        <Route path="/results" element={<ResultsPage />} />

        {/* Admin Pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AutomationShell>
  );
}
