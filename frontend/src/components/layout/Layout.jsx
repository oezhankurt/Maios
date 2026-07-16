import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useAuthStore } from '../../store/authStore';

const TITLES = {
  '/': 'Dashboard',
  '/research': 'Black Box · Produktrecherche',
  '/research/keywords': 'Black Box · Keyword-Recherche',
  '/research/competitors': 'Black Box · Wettbewerber',
  '/research/niche': 'Black Box · Nische',
  '/research/targeting': 'Black Box · Produkt-Targeting',
  '/research/analytics': 'Black Box · Elite Analytics',
  '/keywords': 'Keyword Master',
  '/keywords/cerebro': 'Cerebro · Reverse-ASIN',
  '/keywords/rankings': 'Ranking Tracker',
  '/ppc': 'Advertising · Zeitvergleich',
  '/ppc/campaigns': 'Advertising · Kampagnen',
  '/ppc/portfolios': 'Advertising · Smart Portfolios',
  '/ppc/automation': 'Advertising · Automation',
  '/listings': 'Produkte & Preis',
  '/listings/score': 'Listing-Analyse',
  '/listings/builder': 'Listing Builder',
  '/listings/analyzer': 'Listing Analyzer',
  '/listings/index': 'Index Checker',
  '/listings/scribbles': 'Scribbles',
  '/channels': 'Kanäle · Übersicht',
  '/channels/marketplaces': 'Marktplätze',
  '/channels/search': 'Suchmaschinen',
  '/channels/ads': 'Advertising-Plattformen (DACH)',
  '/google-ads': 'Google Ads',
  '/google-ads/campaigns': 'Google Ads · Kampagnen',
  '/google-ads/keywords': 'Google Ads · Keywords',
  '/google-ads/budget': 'Google Ads · Budget',
  '/bing-ads': 'Bing Ads',
  '/bing-ads/campaigns': 'Bing Ads · Kampagnen',
  '/bing-ads/performance': 'Bing Ads · Performance',
  '/analytics': 'Analytics',
  '/audience': 'Audience',
  '/login-history': 'Login Verlauf',
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
