import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { showToast } from './Toast/Toast';

export default function SchedulePublishModal({ listing, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const authToken = useAuthStore((s) => s.token);

  const platforms = [
    { id: 'amazon', label: '🟠 Amazon', color: 'orange' },
    { id: 'ebay', label: '🔴 eBay', color: 'red' },
    { id: 'kaufland', label: '🔵 Kaufland', color: 'blue' },
    { id: 'otto', label: '🟢 Otto', color: 'green' },
  ];

  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSchedule = async () => {
    if (!selectedDate) {
      showToast('Datum auswählen', 'error');
      return;
    }

    if (selectedPlatforms.length === 0) {
      showToast('Mindestens eine Plattform auswählen', 'error');
      return;
    }

    setLoading(true);

    try {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const response = await fetch(`/api/listings/schedule/${listing.id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          platforms: selectedPlatforms,
          scheduledDate: scheduledDateTime.toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('✓ Veröffentlichung geplant', 'success');
        onSuccess?.();
        onClose?.();
      } else {
        showToast(data.error || 'Planung fehlgeschlagen', 'error');
      }
    } catch (error) {
      showToast('Fehler beim Planen der Veröffentlichung', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">⏰ Veröffentlichung Planen</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Produkt</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {listing.productName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Datum *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Zeit *</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Plattformen *</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`px-3 py-1 text-sm rounded transition ${
                    selectedPlatforms.includes(platform.id)
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {platform.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg text-sm text-blue-900 dark:text-blue-100">
            ℹ️ Das Listing wird zu der geplanten Zeit automatisch veröffentlicht
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSchedule}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
            >
              {loading ? '⏳ Planung...' : '✓ Planen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
