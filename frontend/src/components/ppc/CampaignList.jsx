import CampaignCard from './CampaignCard.jsx';

export default function CampaignList({ campaigns = [], selectedId, onSelect }) {
  if (campaigns.length === 0) {
    return <div className="card empty">No campaigns yet. Create one to get started.</div>;
  }
  return (
    <div className="grid grid-3">
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} selected={c.id === selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}
