import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useAuthStore } from '../../store/authStore';

const TITLES = {
  '/': 'Dashboard',
  '/keywords': 'Keyword Master',
  '/keywords/rankings': 'Ranking Tracker',
  '/ppc': 'Advertising · Zeitvergleich',
  '/ppc/campaigns': 'Advertising · Kampagnen',
  '/ppc/portfolios': 'Advertising · Smart Portfolios',
  '/ppc/automation': 'Advertising · Automation',
  '/listings': 'Produkte & Preis',
  '/listings/score': 'Listing-Analyse',
  '/channels': 'Kanäle & Marktplätze',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const refresh = useAuthStore((s) => s.refresh);

  // Validate the session on mount.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const title = TITLES[location.pathname] || 'Maios';

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="main">
        <Header title={title} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
