import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <EventProvider eventId="default-event">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </EventProvider>
    </BrowserRouter>
  );
}

export default App;
