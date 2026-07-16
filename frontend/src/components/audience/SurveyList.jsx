import { useState } from 'react';
import { AudienceAPI } from '../../api/api';
import SurveyDetail from './SurveyDetail.jsx';
import Loading from '../layout/Loading.jsx';

export default function SurveyList({ surveys: initialSurveys }) {
  const [surveys] = useState(initialSurveys);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const openSurvey = async (id) => {
    setLoading(true);
    try {
      const data = await AudienceAPI.get(id);
      setSelectedData(data);
      setSelectedId(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (selectedId && selectedData) {
    return (
      <div>
        <button
          className="btn btn-sm"
          onClick={() => {
            setSelectedId(null);
            setSelectedData(null);
          }}
          style={{ marginBottom: 16 }}
        >
          ← Zurück zu Umfragen
        </button>
        {loading ? <Loading label="Lade Umfrage..." /> : <SurveyDetail survey={selectedData} />}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {surveys.map((survey) => (
        <div
          key={survey.id}
          style={{
            padding: 12,
            border: '1px solid var(--border)',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.15s',
            backgroundColor: 'var(--bg)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.backgroundColor = 'var(--bg)';
          }}
          onClick={() => openSurvey(survey.id)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{survey.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {survey.respondents} Befragte · {survey.status} · {survey.createdAt}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
              <span
                className={`badge badge-${survey.status === 'Aktiv' ? 'success' : 'muted'}`}
                style={{ display: 'inline-block' }}
              >
                {survey.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
