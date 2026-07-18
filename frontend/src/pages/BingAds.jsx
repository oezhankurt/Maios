import { useState, useEffect } from 'react';
import { BingAdsAPI } from '../api/api';
import Loading from '../components/layout/Loading.jsx';
import BingAdsDashboard from '../components/ads/BingAdsDashboard.jsx';
import BingAdsCampaigns from '../components/ads/BingAdsCampaigns.jsx';
import BingAdsPerformance from '../components/ads/BingAdsPerformance.jsx';
import './BingAds.css';

export default function BingAds({ view = 'overview' }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const c = await BingAdsAPI.getCampaigns();
        setCampaigns(c);
        if (c.length > 0) setSelectedCampaign(c[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loading label="Bing Ads werden geladen..." />;

  return (
    <div>
      <div className="page-header">
        <h1>Bing Ads</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>
          Verwalte deine Bing Ads Kampagnen & Performance
        </span>
      </div>

      {view === 'overview' && <BingAdsDashboard campaigns={campaigns} />}

      {view === 'campaigns' && (
        <BingAdsCampaigns
          campaigns={campaigns}
          selectedId={selectedCampaign}
          onSelect={setSelectedCampaign}
        />
      )}

      {view === 'performance' && selectedCampaign && (
        <BingAdsPerformance campaignId={selectedCampaign} />
      )}
    </div>
  );
}
