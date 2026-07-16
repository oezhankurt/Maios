import { useEffect, useState } from 'react';
import { ResearchAPI } from '../api/api';
import ProductsTab from '../components/research/ProductsTab.jsx';
import KeywordsTab from '../components/research/KeywordsTab.jsx';
import CompetitorsTab from '../components/research/CompetitorsTab.jsx';

const TITLES = {
  products: 'Black Box · Produkte',
  keywords: 'Black Box · Keywords',
  competitors: 'Black Box · Wettbewerber',
};

/**
 * Black Box — product & keyword market research (Helium 10 style). The active
 * tab is driven by the route (`view` prop) so it fits the accordion sidebar.
 */
export default function ProductResearch({ view = 'products' }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    ResearchAPI.meta().then((d) => setCategories(d.categories || [])).catch(() => setCategories([]));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>{TITLES[view] || 'Black Box'}</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>Produkt- & Keyword-Recherche · Demo-Markt</span>
      </div>

      {view === 'products' && <ProductsTab categories={categories} />}
      {view === 'keywords' && <KeywordsTab categories={categories} />}
      {view === 'competitors' && <CompetitorsTab />}
    </div>
  );
}
