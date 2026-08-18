// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GlobalConfigProvider } from './context/GlobalConfigContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { Schedule } from './pages/Schedule';
import { FAQ } from './pages/FAQ';
import { LoginRegister } from './pages/LoginRegister';
import { TeamDashboard } from './pages/TeamDashboard';
import { QuizEngine } from './pages/QuizEngine';
import { ThemeRevealPortal } from './pages/ThemeRevealPortal';
import { BiddingDashboard } from './pages/BiddingDashboard';
import { AdminPanel } from './pages/AdminPanel';

// Protected Route wrappers
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalConfigProvider>
          <div className="min-h-screen bg-black text-white flex flex-col selection:bg-red-600 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/login" element={<LoginRegister />} />

                {/* Participant Protected Routes */}
                <Route
                  path="/team"
                  element={
                    <ProtectedRoute>
                      <TeamDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz"
                  element={
                    <ProtectedRoute>
                      <QuizEngine />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/themes"
                  element={
                    <ProtectedRoute>
                      <ThemeRevealPortal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bidding"
                  element={
                    <ProtectedRoute>
                      <BiddingDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Route */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </GlobalConfigProvider>
      </AuthProvider>
    </Router>
  );
}
