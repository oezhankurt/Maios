import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import '../pages/Scribbles.css';

export default function Scribbles() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('scribbles-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [asinInput, setAsinInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
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
      favorite: false,
      createdAt: new Date().toLocaleDateString('de-DE'),
    };

    setNotes([newNote, ...notes]);
    setAsinInput('');
    setNoteInput('');
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
  };

  const saveEdit = (id) => {
    setNotes(notes.map(n =>
      n.id === id ? { ...n, note: editText.trim() } : n
    ));
    setEditingId(null);
    showSuccess('Notiz aktualisiert!');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.favorite !== b.favorite) return b.favorite ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="scribbles-page">
      <div className="scribbles-header">
        <div>
          <h1>📝 Notizen & Merkzettel</h1>
          <p>Speichere ASINs und wichtige Notizen</p>
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
          {sortedNotes.length === 0 ? (
            <div className="empty-state">
              <p>Keine Notizen vorhanden</p>
              <span>Erstelle deine erste ASIN-Notiz!</span>
            </div>
          ) : (
            sortedNotes.map(note => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
