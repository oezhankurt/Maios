import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// Collapsible navigation: top-level items are either direct links or
// categories that expand to reveal their sub-pages (accordion style).
const NAV = [
  { label: 'Dashboard', icon: '📊', to: '/' },
  {
    label: 'Marktplätze', icon: '🌐', children: [
      {
        label: 'Amazon', collapsible: true, children: [
          { label: 'Listings Manager', to: '/listings' },
          { label: 'Listing Builder Pro', to: '/listings/amazon-builder' },
          { label: 'Listing Analyzer', to: '/listings/analyzer' },
          { label: 'Listing-Analyse', to: '/listings/score' },
          { label: 'Index Checker', to: '/listings/index' },
          { label: 'Scribbles', to: '/listings/scribbles' },
          { label: 'Repricing', to: '/pricing' },
          { label: 'Keywords', to: '/keywords' },
          { label: 'Cerebro · Reverse-ASIN', to: '/keywords/cerebro' },
          { label: 'Rankings', to: '/keywords/rankings' },
          { label: 'PPC Kampagnen', to: '/ppc' },
          { label: 'Smart Portfolios', to: '/ppc/portfolios' },
          { label: 'Automation', to: '/ppc/automation' },
        ],
      },
      { label: 'Otto', collapsible: true, children: [{ label: 'Coming soon...', to: '#' }] },
      { label: 'Kaufland', collapsible: true, children: [{ label: 'Coming soon...', to: '#' }] },
      { label: 'eBay', collapsible: true, children: [{ label: 'Coming soon...', to: '#' }] },
    ],
  },
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
  { label: 'Analytics', icon: '📈', to: '/analytics' },
  { label: 'Audience', icon: '👥', to: '/audience' },
  {
    label: 'Einstellungen', icon: '⚙️', children: [
      { label: 'Konto-Einstellungen', to: '/settings' },
      { label: 'Login Verlauf', to: '/login-history' },
    ],
  },
];

function matchesChild(pathname, to) {
  return to && (pathname === to || pathname.startsWith(`${to}/`));
}

function findActiveGroup(pathname) {
  for (const item of NAV) {
    if (!item.children) continue;
    for (const child of item.children) {
      if (child.children) {
        if (child.children.some((c) => matchesChild(pathname, c.to))) {
          return { parent: item.label, child: child.label };
        }
      } else if (matchesChild(pathname, child.to)) {
        return { parent: item.label };
      }
    }
  }
  return null;
}

export default function Sidebar({ open, onNavigate }) {
  const { pathname } = useLocation();
  const active = findActiveGroup(pathname);
  const [openGroups, setOpenGroups] = useState({});
  const [openMarketplaces, setOpenMarketplaces] = useState({});

  const isOpen = (label) => (label in openGroups ? openGroups[label] : label === active?.parent);
  const toggle = (label) => setOpenGroups((g) => ({ ...g, [label]: !isOpen(label) }));
  const isMarketplaceOpen = (label) => openMarketplaces[label] || label === active?.child;
  const toggleMarketplace = (label) => setOpenMarketplaces((m) => ({ ...m, [label]: !isMarketplaceOpen(label) }));

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        M<span className="brand-accent">ai</span>os
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
          const groupActive = item.label === active?.parent;
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
                  {item.children.map((c) => {
                    if (c.children && c.collapsible) {
                      const marketplaceExpanded = isMarketplaceOpen(c.label);
                      return (
                        <div key={c.label}>
                          <button
                            type="button"
                            className="nav-marketplace"
                            onClick={() => toggleMarketplace(c.label)}
                          >
                            <span>{c.label}</span>
                            <span className={`caret ${marketplaceExpanded ? 'open' : ''}`}>›</span>
                          </button>
                          {marketplaceExpanded && (
                            <div className="marketplace-items">
                              {c.children.map((sub) => (
                                <NavLink
                                  key={sub.to}
                                  to={sub.to}
                                  end
                                  className={({ isActive }) => `nav-child ${isActive ? 'active' : ''}`}
                                  onClick={onNavigate}
                                >
                                  {sub.label}
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    if (c.children) {
                      return (
                        <div key={c.label} style={{ paddingLeft: '8px' }}>
                          <div
                            style={{
                              padding: '8px 0',
                              fontWeight: 500,
                              color: '#666',
                              fontSize: '13px',
                            }}
                          >
                            {c.label}
                          </div>
                          <div style={{ paddingLeft: '8px' }}>
                            {c.children.map((sub) => (
                              <NavLink
                                key={sub.to}
                                to={sub.to}
                                end
                                className={({ isActive }) => `nav-child ${isActive ? 'active' : ''}`}
                                onClick={onNavigate}
                                style={{ fontSize: '13px', paddingLeft: '12px' }}
                              >
                                {sub.label}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        end
                        className={({ isActive }) => `nav-child ${isActive ? 'active' : ''}`}
                        onClick={onNavigate}
                      >
                        {c.label}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
