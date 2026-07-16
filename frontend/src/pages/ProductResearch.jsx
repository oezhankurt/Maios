import { useEffect, useState } from 'react';
import { ResearchAPI } from '../api/api';
import ProductsTab from '../components/research/ProductsTab.jsx';
import KeywordsTab from '../components/research/KeywordsTab.jsx';
import CompetitorsTab from '../components/research/CompetitorsTab.jsx';
import NicheTab from '../components/research/NicheTab.jsx';
import TargetingTab from '../components/research/TargetingTab.jsx';
import EliteAnalyticsTab from '../components/research/EliteAnalyticsTab.jsx';

const TITLES = {
  products: 'Black Box · Produkte',
  keywords: 'Black Box · Keywords',
  competitors: 'Black Box · Wettbewerber',
  niche: 'Black Box · Nische',
  targeting: 'Black Box · Produkt-Targeting',
  analytics: 'Black Box · Elite Analytics',
};

/**
 * Black Box — product & keyword market research (Helium 10 style). The active
 * tab is driven by the route (`view` prop) so it fits the accordion sidebar.
 */
export default function ProductResearch({ view = 'products' }) {
  const [meta, setMeta] = useState({ categories: [], sizeTiers: [], targetSources: [] });

  useEffect(() => {
    ResearchAPI.meta()
      .then((d) => setMeta({ categories: d.categories || [], sizeTiers: d.sizeTiers || [], targetSources: d.targetSources || [] }))
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>{TITLES[view] || 'Black Box'}</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>Produkt- & Keyword-Recherche · Demo-Markt</span>
      </div>

      {view === 'products' && <ProductsTab categories={meta.categories} />}
      {view === 'keywords' && <KeywordsTab categories={meta.categories} />}
      {view === 'competitors' && <CompetitorsTab />}
      {view === 'niche' && <NicheTab categories={meta.categories} sizeTiers={meta.sizeTiers} />}
      {view === 'targeting' && <TargetingTab targetSources={meta.targetSources} />}
      {view === 'analytics' && <EliteAnalyticsTab />}
    </div>
  );
}
