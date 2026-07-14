import { useEffect, useState } from 'react';
import { ProductAPI, KeywordAPI, RankingAPI } from '../api/api';
import { useFilterStore } from '../store/filterStore';
import ProductPicker from '../components/layout/ProductPicker.jsx';
import KeywordSearch from '../components/keywords/KeywordSearch.jsx';
import KeywordTable from '../components/keywords/KeywordTable.jsx';
import RankingTracker from '../components/keywords/RankingTracker.jsx';
import RankingTrend from '../components/keywords/RankingTrend.jsx';
import CompetitorAnalysis from '../components/keywords/CompetitorAnalysis.jsx';
import Loading from '../components/layout/Loading.jsx';

export default function Keywords() {
  const { selectedProduct, setSelectedProduct, marketplace, setMarketplace } = useFilterStore();
  const [products, setProducts] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProductAPI.list().then((data) => {
      setProducts(data);
      if (!selectedProduct && data[0]) setSelectedProduct(data[0].id);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadForProduct = async () => {
    if (!selectedProduct) return;
    const [kw, rk] = await Promise.all([
      KeywordAPI.forProduct(selectedProduct),
      RankingAPI.forProduct(selectedProduct, { marketplace }),
    ]);
    setKeywords(kw);
    setRankings(rk);
    if (kw[0]) setSelectedKeyword((prev) => prev || kw[0].id);
  };

  useEffect(() => {
    loadForProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct, marketplace]);

  const addKeyword = async (row) => {
    await KeywordAPI.create({
      productId: selectedProduct,
      keyword: row.keyword,
      keywordType: 'organic',
      searchVolume: row.searchVolume,
      cpc: row.cpc,
      difficultyScore: row.difficultyScore,
    });
    loadForProduct();
  };

  const removeKeyword = async (id) => {
    await KeywordAPI.remove(id);
    loadForProduct();
  };

  const product = products.find((p) => p.id === selectedProduct);

  if (loading) return <Loading label="Loading keywords…" />;

  return (
    <div>
      <div className="page-header">
        <h1>Keywords</h1>
        <ProductPicker products={products} value={selectedProduct} onChange={setSelectedProduct} />
      </div>

      {!selectedProduct ? (
        <div className="card empty">Create a product first to research and track keywords.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <KeywordSearch product={product} onAdd={addKeyword} />

          <div className="grid" style={{ gridTemplateColumns: '3fr 2fr' }}>
            <KeywordTable keywords={keywords} onRemove={removeKeyword} />
            <CompetitorAnalysis keywords={keywords} />
          </div>

          <div className="grid" style={{ gridTemplateColumns: '3fr 2fr' }}>
            <RankingTracker
              rankings={rankings}
              marketplace={marketplace}
              onMarketplaceChange={setMarketplace}
              onSelectKeyword={setSelectedKeyword}
            />
            <RankingTrend keywordId={selectedKeyword} marketplace={marketplace} />
          </div>
        </div>
      )}
    </div>
  );
}
