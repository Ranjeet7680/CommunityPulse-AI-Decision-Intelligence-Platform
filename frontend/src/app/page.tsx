"use client";

import React from 'react';
import { useStore } from '../lib/store';
import LandingPage from './components/LandingPage';
import AuthPage from './auth/page';
import OnboardingPage from './onboarding/page';
import Dashboard from './dashboard/page';

export default function Home() {
  const { currentView } = useStore();

  return (
    <main className="min-h-screen">
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'auth' && <AuthPage />}
      {currentView === 'onboarding' && <OnboardingPage />}
      {currentView === 'dashboard' && <Dashboard />}
    </main>
  );
}
