import { useState } from 'react';

export default function ScribbleEditor({ data }) {
  const [copied, setCopied] = useState(null);

  const copy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          📝 Feld: {data.field}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            Richtlinien
          </div>
          <ul style={{ paddingLeft: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            {data.guidelines.map((g, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {data.suggestions.map((suggestion, idx) => (
          <div key={idx} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text)' }}>
                  {suggestion}
                </div>
              </div>
              <button
                className="btn btn-sm"
                onClick={() => copy(suggestion, idx)}
                style={{ whiteSpace: 'nowrap', flex: 'none' }}
              >
                {copied === idx ? '✓ Kopiert' : 'Kopieren'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
