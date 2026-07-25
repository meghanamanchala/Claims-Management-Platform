import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { InsurerDashboardPage } from './pages/InsurerDashboardPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('claimflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('claimflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('claimflow_user');
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Simple Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Clean Auth Page */}
        <Route path="/auth" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />

        {/* Dashboards */}
        <Route
          path="/patient"
          element={<PatientDashboardPage currentUser={currentUser} setCurrentUser={handleLoginSuccess} />}
        />
        <Route
          path="/insurer"
          element={<InsurerDashboardPage currentUser={currentUser} setCurrentUser={handleLoginSuccess} />}
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
