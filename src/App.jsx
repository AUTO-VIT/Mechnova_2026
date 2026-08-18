import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <EventProvider eventId="default-event">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </EventProvider>
    </BrowserRouter>
  );
}

export default App;
