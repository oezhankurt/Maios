import { useState, useEffect } from 'react';
import { GoogleAdsAPI } from '../api/api';
import Loading from '../components/layout/Loading.jsx';
import GoogleAdsDashboard from '../components/ads/GoogleAdsDashboard.jsx';
import GoogleAdsCampaigns from '../components/ads/GoogleAdsCampaigns.jsx';
import GoogleAdsKeywords from '../components/ads/GoogleAdsKeywords.jsx';
import GoogleAdsBudget from '../components/ads/GoogleAdsBudget.jsx';
import './GoogleAds.css';

export default function GoogleAds({ view = 'overview' }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, b] = await Promise.all([
          GoogleAdsAPI.getCampaigns(),
          GoogleAdsAPI.getBudgetAllocation(),
        ]);
        setCampaigns(c);
        setBudget(b);
        if (c.length > 0) setSelectedCampaign(c[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loading label="Google Ads werden geladen..." />;

  return (
    <div>
      <div className="page-header">
        <h1>Google Ads</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>
          Verwalte deine Google Ads Kampagnen, Keywords & Budget
        </span>
      </div>

      {view === 'overview' && (
        <GoogleAdsDashboard campaigns={campaigns} budget={budget} />
      )}

      {view === 'campaigns' && (
        <GoogleAdsCampaigns
          campaigns={campaigns}
          selectedId={selectedCampaign}
          onSelect={setSelectedCampaign}
        />
      )}

      {view === 'keywords' && selectedCampaign && (
        <GoogleAdsKeywords campaignId={selectedCampaign} />
      )}

      {view === 'budget' && <GoogleAdsBudget budget={budget} />}
    </div>
  );
}
