import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// Collapsible navigation: top-level items are either direct links or
// categories that expand to reveal their sub-pages (accordion style).
const NAV = [
  { label: 'Dashboard', icon: '📊', to: '/' },
  {
    label: 'Produktrecherche', icon: '🔍', children: [
      { label: 'Black Box · Produkte', to: '/research' },
      { label: 'Keyword-Recherche', to: '/research/keywords' },
      { label: 'Wettbewerber', to: '/research/competitors' },
      { label: 'Nische', to: '/research/niche' },
      { label: 'Produkt-Targeting', to: '/research/targeting' },
      { label: 'Elite Analytics', to: '/research/analytics' },
    ],
  },
  {
    label: 'Keywords', icon: '🔑', children: [
      { label: 'Keyword Master', to: '/keywords' },
      { label: 'Cerebro · Reverse-ASIN', to: '/keywords/cerebro' },
      { label: 'Rankings', to: '/keywords/rankings' },
    ],
  },
  {
    label: 'Advertising', icon: '🎯', children: [
      { label: 'Zeitvergleich', to: '/ppc' },
      { label: 'Kampagnen', to: '/ppc/campaigns' },
      { label: 'Smart Portfolios', to: '/ppc/portfolios' },
      { label: 'Automation', to: '/ppc/automation' },
    ],
  },
  {
    label: 'Listings', icon: '📦', children: [
      { label: 'Produkte & Preis', to: '/listings' },
      { label: 'Listing-Analyse', to: '/listings/score' },
      { label: 'Listing Builder', to: '/listings/builder' },
      { label: 'Listing Analyzer', to: '/listings/analyzer' },
      { label: 'Index Checker', to: '/listings/index' },
      { label: 'Scribbles', to: '/listings/scribbles' },
    ],
  },
  {
    label: 'Marktplätze', icon: '🌐', children: [
      { label: 'Übersicht', to: '/channels' },
      { label: 'Marktplätze', to: '/channels/marketplaces' },
      { label: 'Suchmaschinen', to: '/channels/search' },
      { label: 'Advertising-Plattformen', to: '/channels/ads' },
    ],
  },
  { label: 'Analytics', icon: '📈', to: '/analytics' },
  { label: 'Audience', icon: '👥', to: '/audience' },
  { label: 'Einstellungen', icon: '⚙️', to: '/settings' },
];

function matchesChild(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function Sidebar({ open, onNavigate }) {
  const { pathname } = useLocation();
  const activeGroup = NAV.find(
    (n) => n.children && n.children.some((c) => matchesChild(pathname, c.to))
  )?.label;
  const [openGroups, setOpenGroups] = useState({});
  const isOpen = (label) => (label in openGroups ? openGroups[label] : label === activeGroup);
  const toggle = (label) => setOpenGroups((g) => ({ ...g, [label]: !isOpen(label) }));

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        Ma<span>ios</span>
      </div>
      <nav>
        {NAV.map((item) => {
          if (!item.children) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onNavigate}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            );
          }
          const expanded = isOpen(item.label);
          const groupActive = item.label === activeGroup;
          return (
            <div key={item.label}>
              <button
                type="button"
                className={`nav-link nav-group ${groupActive ? 'group-active' : ''}`}
                onClick={() => toggle(item.label)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                <span className={`nav-caret ${expanded ? 'open' : ''}`}>›</span>
              </button>
              {expanded && (
                <div className="nav-children">
                  {item.children.map((c) => (
                    <NavLink
                      key={c.to}
                      to={c.to}
                      end
                      className={({ isActive }) => `nav-child ${isActive ? 'active' : ''}`}
                      onClick={onNavigate}
                    >
                      {c.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
