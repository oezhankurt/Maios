import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { showToast } from './Toast/Toast';

export default function BulkOperationsPanel({ selectedListings, onOperationComplete }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
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

  const handleBulkOptimize = async () => {
    if (selectedListings.length === 0) {
      showToast('Select listings to optimize', 'error');
      return;
    }

    if (selectedPlatforms.length === 0) {
      showToast('Select platforms for optimization', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/listings/bulk/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          listingIds: selectedListings,
          platforms: selectedPlatforms,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          `✓ Optimized ${data.successful.length} listings (avg score: ${data.averageScore}%)`,
          'success'
        );
        onOperationComplete?.();
      } else {
        showToast(data.error || 'Optimization failed', 'error');
      }
    } catch (error) {
      showToast('Error optimizing listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedListings.length === 0) {
      showToast('Select listings to publish', 'error');
      return;
    }

    if (selectedPlatforms.length === 0) {
      showToast('Select platforms for publishing', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/listings/bulk/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          listingIds: selectedListings,
          platforms: selectedPlatforms,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          `✓ Published ${data.publishedCount} listings to ${data.platformsPublished.length} platforms`,
          'success'
        );
        onOperationComplete?.();
      } else {
        showToast(data.error || 'Publishing failed', 'error');
      }
    } catch (error) {
      showToast('Error publishing listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedListings.length === 0) {
      showToast('Select listings to archive', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/listings/bulk/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          listingIds: selectedListings,
          status: 'archived',
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(`✓ Archived ${data.updatedCount} listings`, 'success');
        onOperationComplete?.();
      } else {
        showToast(data.error || 'Archiving failed', 'error');
      }
    } catch (error) {
      showToast('Error archiving listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedListings.length} listings? This cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/listings/bulk/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ listingIds: selectedListings }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(`✓ Deleted ${data.deletedCount} listings`, 'success');
        onOperationComplete?.();
      } else {
        showToast(data.error || 'Deletion failed', 'error');
      }
    } catch (error) {
      showToast('Error deleting listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (selectedListings.length === 0) {
    return null;
  }

  return (
    <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
      <div className="flex flex-wrap gap-4 items-center">
        <span className="text-sm font-semibold">
          {selectedListings.length} selected
        </span>

        <div className="flex gap-2">
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

        <div className="flex gap-2 ml-auto">
          <button
            onClick={handleBulkOptimize}
            disabled={loading || selectedPlatforms.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition"
          >
            🤖 Optimize
          </button>
          <button
            onClick={handleBulkPublish}
            disabled={loading || selectedPlatforms.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition"
          >
            ✓ Publish
          </button>
          <button
            onClick={handleBulkArchive}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition"
          >
            📦 Archive
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
