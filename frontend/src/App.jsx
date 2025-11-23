import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Playground } from './pages/Playground';
import { Runs } from './pages/Runs';
import { Tools } from './pages/Tools';
import { Build } from './pages/Build';

import { LandingPage } from './pages/LandingPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage navigate={navigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'playground':
        return <Playground />;
      case 'inspect':
        return <Runs />;
      case 'tools':
        return <Tools />;
      case 'build':
        return <Build />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <AppShell currentPage={currentPage} onNavigate={navigate}>
      {renderPage()}
    </AppShell>
  );
}