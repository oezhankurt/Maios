import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { showToast } from './Toast/Toast';

export default function ListingTemplateLibrary({ onSelectTemplate, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const authToken = useAuthStore((s) => s.token);

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('limit', '100');

      const response = await fetch(`/api/listings/templates?${params}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();
      if (data.success) {
        setTemplates(data.data.templates || []);
      }
    } catch (error) {
      showToast('Fehler beim Laden von Templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/listings/templates/categories', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSelectTemplate = (template) => {
    onSelectTemplate?.(template);
    onClose?.();
  };

  const handleDeleteTemplate = async (templateId, e) => {
    e.stopPropagation();
    if (!window.confirm('Template wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/listings/templates/${templateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();
      if (data.success) {
        showToast('✓ Template gelöscht', 'success');
        loadTemplates();
      } else {
        showToast(data.error || 'Fehler beim Löschen', 'error');
      }
    } catch (error) {
      showToast('Fehler beim Löschen des Templates', 'error');
    }
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📚 Template Bibliothek</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Templates durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-sm"
          />

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 text-sm rounded transition ${
                  selectedCategory === ''
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Alle
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-sm rounded transition ${
                    selectedCategory === cat
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500">Wird geladen...</div>
          ) : filteredTemplates.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                    {template.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {template.platforms?.map((p) => (
                        <span
                          key={p}
                          className="text-xs bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteTemplate(template.id, e)}
                    className="ml-2 text-red-600 hover:text-red-800 text-xs"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Keine Templates gefunden
            </div>
          )}
        </div>

        <div className="flex gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
