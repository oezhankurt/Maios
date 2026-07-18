import { useState, useEffect } from 'react';
import { AudienceAPI } from '../api/api';
import Loading from '../components/layout/Loading.jsx';
import SurveyList from '../components/audience/SurveyList.jsx';
import './Audience.css';

export default function Audience() {
  const [surveys, setSurveys] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, s] = await Promise.all([AudienceAPI.meta(), AudienceAPI.list()]);
        setMeta(m);
        setSurveys(s);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const createSurvey = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreatingNew(true);
    try {
      const survey = await AudienceAPI.create({ title: newTitle.trim() });
      setSurveys([...surveys, survey]);
      setNewTitle('');
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingNew(false);
    }
  };

  if (loading) return <Loading label="Umfragen werden geladen..." />;

  return (
    <div>
      <div className="page-header">
        <h1>Audience</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>Verbraucherforschung & Marktanalyse</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="stat-label">Aktive Umfragen</div>
          <div className="stat-value">{meta?.activeSurveys || 0}</div>
        </div>
        <div className="card">
          <div className="stat-label">Gesamte Befragte</div>
          <div className="stat-value">{meta?.totalRespondents || 0}</div>
        </div>
        <div className="card">
          <div className="stat-label">Kosten pro Antwort</div>
          <div className="stat-value">€{meta?.costPerResponse || 0}</div>
        </div>
        <div className="card">
          <div className="stat-label">Verfügbare Antworten</div>
          <div className="stat-value">{meta?.maxResponses - meta?.usedResponses || 0}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Umfragen</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? '✕ Abbrechen' : '+ Neue Umfrage'}
          </button>
        </div>

        {showCreate && (
          <form onSubmit={createSurvey} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder="Umfrage-Titel"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
              <button className="btn btn-primary" disabled={creatingNew || !newTitle.trim()}>
                {creatingNew ? 'Erstelle...' : 'Erstellen'}
              </button>
            </div>
          </form>
        )}

        {surveys.length > 0 ? (
          <SurveyList surveys={surveys} />
        ) : (
          <div className="empty">Keine Umfragen. Erstellen Sie eine neue Umfrage!</div>
        )}
      </div>
    </div>
  );
}
