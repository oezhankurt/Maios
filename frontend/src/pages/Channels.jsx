import { useEffect, useState } from 'react';
import { ChannelAPI } from '../api/api';
import Loading from '../components/layout/Loading.jsx';

const STATUS_BADGE = { connected: 'badge-success', ready: 'badge-info', demo: 'badge-muted' };
const STATUS_LABEL = { connected: 'verbunden', ready: 'bereit', demo: 'Demo' };

function ChannelCard({ c }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
      <div className="row between">
        <span style={{ fontWeight: 700 }}>{c.label}</span>
        <span className={`badge ${STATUS_BADGE[c.status] || 'badge-muted'}`}>
          {STATUS_LABEL[c.status] || c.status}
        </span>
      </div>
      <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>Region: {c.region}</div>
    </div>
  );
}

function Group({ title, subtitle, items }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-title" style={{ marginBottom: 4 }}>{title}</div>
      <div className="text-muted" style={{ fontSize: 12, marginBottom: 14 }}>{subtitle}</div>
      <div className="grid grid-3">
        {items.map((c) => <ChannelCard key={c.id} c={c} />)}
      </div>
    </div>
  );
}

/**
 * Channel overview — all marketplaces, search engines and advertising
 * platforms (DACH) as categories with connection status.
 */
const TITLES = {
  overview: 'Kanäle · Übersicht',
  marketplaces: '🛒 Marktplätze',
  search: '🔎 Suchmaschinen',
  ads: '🎯 Advertising-Plattformen (DACH)',
};

export default function Channels({ view = 'overview' }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    ChannelAPI.list().then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <Loading label="Lade Kanäle…" />;

  const total = data.marketplaces.length + data.searchEngines.length + data.adPlatforms.length;
  const infoBox = (
    <div className="card" style={{ background: 'rgba(56,189,248,0.06)' }}>
      <div className="text-muted" style={{ fontSize: 13 }}>
        ℹ️ Alle Kanäle laufen aktuell im <strong>Demo-Modus</strong>. Sobald die jeweiligen
        Schnittstellen (Amazon SP-API/Ads, Google Ads, Microsoft Ads, Kaufland, Otto …)
        verbunden sind, fließen echte Daten je Kanal — der Aufbau ist bereits „API-ready".
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>{TITLES[view] || 'Kanäle & Marktplätze'}</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>{total} Kanäle · DACH</span>
      </div>

      {view === 'overview' && (
        <>
          <Group
            title="🛒 Marktplätze"
            subtitle="Vertriebskanäle — hier laufen deine Verkäufe, Rankings und Preise zusammen."
            items={data.marketplaces}
          />
          <Group
            title="🔎 Suchmaschinen"
            subtitle="Für Off-Amazon-SEO und externe Keyword-Nachfrage."
            items={data.searchEngines}
          />
          <Group
            title="🎯 Advertising-Plattformen (DACH)"
            subtitle="Alle Werbeplattformen — Grundlage für plattformübergreifendes Bidding & Reporting."
            items={data.adPlatforms}
          />
        </>
      )}

      {view === 'marketplaces' && (
        <Group
          title="🛒 Marktplätze"
          subtitle="Vertriebskanäle — hier laufen deine Verkäufe, Rankings und Preise zusammen."
          items={data.marketplaces}
        />
      )}

      {view === 'search' && (
        <Group
          title="🔎 Suchmaschinen"
          subtitle="Für Off-Amazon-SEO und externe Keyword-Nachfrage."
          items={data.searchEngines}
        />
      )}

      {view === 'ads' && (
        <Group
          title="🎯 Advertising-Plattformen (DACH)"
          subtitle="Alle Werbeplattformen — Grundlage für plattformübergreifendes Bidding & Reporting."
          items={data.adPlatforms}
        />
      )}

      {infoBox}
    </div>
  );
}
