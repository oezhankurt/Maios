import { currency, percent } from '../../utils/format';

const STATUS_BADGE = { active: 'badge-success', paused: 'badge-warning', archived: 'badge-muted' };

export default function CampaignCard({ campaign, onSelect, selected }) {
  return (
    <div
      className="card"
      style={{ cursor: 'pointer', borderColor: selected ? 'var(--primary)' : 'var(--border)' }}
      onClick={() => onSelect(campaign)}
    >
      <div className="row between">
        <span style={{ fontWeight: 700 }}>{campaign.campaignName}</span>
        <span className={`badge ${STATUS_BADGE[campaign.status] || 'badge-muted'}`}>
          {campaign.status}
        </span>
      </div>
      <div className="row between mt-2" style={{ fontSize: 13 }}>
        <span className="text-muted">Type {campaign.campaignType?.toUpperCase()}</span>
        <span className="text-muted">Budget {currency(campaign.dailyBudget)}/day</span>
      </div>
      <div className="text-muted mt-2" style={{ fontSize: 13 }}>
        Target ACoS {percent(campaign.targetAcos)}
      </div>
    </div>
  );
}
