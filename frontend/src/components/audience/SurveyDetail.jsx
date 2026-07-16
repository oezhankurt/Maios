export default function SurveyDetail({ survey }) {
  if (!survey) return null;

  const { title, respondents, status, questions, insights } = survey;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 4 }}>{title}</h2>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {respondents} Befragte · {status}
        </div>
      </div>

      {insights && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
          <div className="card">
            <div className="stat-label">Primäres Publikum</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 8 }}>
              {insights.primaryAudience}
            </div>
          </div>
          <div className="card">
            <div className="stat-label">Kauffrequenz</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 8 }}>
              {insights.purchaseFrequency}
            </div>
          </div>
          <div className="card">
            <div className="stat-label">Durchschnittlicher Bestellwert</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 8 }}>
              {insights.avgOrderValue}
            </div>
          </div>
        </div>
      )}

      {insights && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Top-Kategorien</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {insights.topCategories.map((cat) => (
              <span key={cat} className="badge badge-info">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {questions && questions.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Umfrageergebnisse</div>
          <div style={{ display: 'grid', gap: 20 }}>
            {questions.map((q, idx) => (
              <div key={idx}>
                <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 13 }}>
                  {idx + 1}. {q.question}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Antwortquote: {q.responseRate * 100}%
                </div>
                {q.responses && Object.entries(q.responses).length > 0 && (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {Object.entries(q.responses).map(([option, count]) => {
                      const total = Object.values(q.responses).reduce((a, b) => a + b, 0);
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={option} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, fontSize: 12 }}>{option}</div>
                          <div
                            style={{
                              height: 6,
                              backgroundColor: 'var(--primary)',
                              borderRadius: 3,
                              width: `${pct}%`,
                              minWidth: 2,
                            }}
                          />
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 30 }}>
                            {pct}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
