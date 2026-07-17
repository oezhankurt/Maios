import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import '../pages/Scribbles.css';

const CATEGORIES = [
  { id: 'competitor', label: '🛍️ Konkurrenzprodukte', color: '#f59e0b' },
  { id: 'keywords', label: '📊 SEO & Keywords', color: '#3b82f6' },
  { id: 'pricing', label: '💰 Preisgestaltung', color: '#10b981' },
  { id: 'performance', label: '📈 Performance', color: '#8b5cf6' },
  { id: 'improvement', label: '🔧 Listing-Verbesserungen', color: '#ef4444' },
  { id: 'general', label: '📝 Allgemeine Notizen', color: '#6b7280' },
];

export default function Scribbles() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('scribbles-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [asinInput, setAsinInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('competitor');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const { success: showSuccess } = useToast();

  useEffect(() => {
    localStorage.setItem('scribbles-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!asinInput.trim() || !noteInput.trim()) return;

    const newNote = {
      id: Date.now(),
      asin: asinInput.toUpperCase().trim(),
      note: noteInput.trim(),
      category: categoryInput,
      favorite: false,
      createdAt: new Date().toLocaleDateString('de-DE'),
    };

    setNotes([newNote, ...notes]);
    setAsinInput('');
    setNoteInput('');
    setCategoryInput('competitor');
    showSuccess('Notiz hinzugefügt!');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const toggleFavorite = (id) => {
    setNotes(notes.map(n =>
      n.id === id ? { ...n, favorite: !n.favorite } : n
    ));
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditText(note.note);
    setEditCategory(note.category);
  };

  const saveEdit = (id) => {
    setNotes(notes.map(n =>
      n.id === id ? { ...n, note: editText.trim(), category: editCategory } : n
    ));
    setEditingId(null);
    showSuccess('Notiz aktualisiert!');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditCategory('');
  };

  // Gruppiere Notizen nach Kategorie
  const groupedNotes = {};
  CATEGORIES.forEach(cat => {
    groupedNotes[cat.id] = [];
  });

  notes.forEach(note => {
    if (groupedNotes[note.category]) {
      groupedNotes[note.category].push(note);
    }
  });

  // Sortiere innerhalb jeder Kategorie
  Object.keys(groupedNotes).forEach(catId => {
    groupedNotes[catId].sort((a, b) => {
      if (a.favorite !== b.favorite) return b.favorite ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  });

  const getCategoryInfo = (id) => CATEGORIES.find(c => c.id === id);

  return (
    <div className="scribbles-page">
      <div className="scribbles-header">
        <div>
          <h1>📝 Notizen & Merkzettel</h1>
          <p>Speichere ASINs und wichtige Notizen - nach Kategorien organisiert</p>
        </div>
      </div>

      <div className="scribbles-container">
        <div className="scribbles-form">
          <div className="form-card">
            <h2>Neue Notiz</h2>
            <div className="form-group">
              <label>ASIN</label>
              <input
                type="text"
                placeholder="z.B. B0F9X766FD"
                value={asinInput}
                onChange={(e) => setAsinInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && noteInput.trim() && addNote()}
              />
            </div>
            <div className="form-group">
              <label>Kategorie</label>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Notiz</label>
              <textarea
                placeholder="Was möchtest du über dieses Produkt notieren?"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={4}
                onKeyPress={(e) => e.ctrlKey && e.key === 'Enter' && addNote()}
              />
            </div>
            <button
              className="btn-add"
              disabled={!asinInput.trim() || !noteInput.trim()}
              onClick={addNote}
            >
              + Hinzufügen
            </button>
          </div>
        </div>

        <div className="scribbles-list">
          {notes.length === 0 ? (
            <div className="empty-state">
              <p>Keine Notizen vorhanden</p>
              <span>Erstelle deine erste ASIN-Notiz!</span>
            </div>
          ) : (
            CATEGORIES.map(category => {
              const categoryNotes = groupedNotes[category.id] || [];
              if (categoryNotes.length === 0) return null;

              return (
                <div key={category.id} className="category-section">
                  <div className="category-header" style={{ borderLeftColor: category.color }}>
                    <h3>{category.label}</h3>
                    <span className="note-count">{categoryNotes.length}</span>
                  </div>

                  <div className="notes-grid">
                    {categoryNotes.map(note => (
                      <div key={note.id} className={`note-card ${note.favorite ? 'favorite' : ''}`}>
                        <div className="note-header">
                          <div className="note-asin">
                            <span className="asin-badge">{note.asin}</span>
                            <span className="note-date">{note.createdAt}</span>
                          </div>
                          <div className="note-actions">
                            <button
                              className={`action-btn favorite ${note.favorite ? 'active' : ''}`}
                              onClick={() => toggleFavorite(note.id)}
                              title={note.favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                            >
                              ⭐
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => deleteNote(note.id)}
                              title="Löschen"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {editingId === note.id ? (
                          <div className="note-edit">
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="category-select"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={3}
                            />
                            <div className="edit-actions">
                              <button className="btn-save" onClick={() => saveEdit(note.id)}>
                                ✓ Speichern
                              </button>
                              <button className="btn-cancel" onClick={cancelEdit}>
                                ✕ Abbrechen
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="note-content" onDoubleClick={() => startEdit(note)}>
                            <p>{note.note}</p>
                            <span className="edit-hint">Doppelklick zum Bearbeiten</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
