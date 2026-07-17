import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';

export default function BulkOperationsPanel({ selectedListings, onOperationComplete }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const authToken = useAuthStore((s) => s.token);
  const { success: showSuccess, error: showError } = useToast();

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
      showError('Select listings to optimize');
      return;
    }

    if (selectedPlatforms.length === 0) {
      showError('Select platforms for optimization');
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
        showSuccess(`✓ Optimized ${data.successful.length} listings (avg score: ${data.averageScore}%)`);
        onOperationComplete?.();
      } else {
        showError(data.error || 'Optimization failed');
      }
    } catch (error) {
      showError('Error optimizing listings');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedListings.length === 0) {
      showError('Select listings to publish');
      return;
    }

    if (selectedPlatforms.length === 0) {
      showError('Select platforms for publishing');
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
        showSuccess(`✓ Published ${data.publishedCount} listings to ${data.platformsPublished.length} platforms`);
        onOperationComplete?.();
      } else {
        showError(data.error || 'Publishing failed');
      }
    } catch (error) {
      showError('Error publishing listings');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedListings.length === 0) {
      showError('Select listings to archive');
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
        showSuccess(`✓ Archived ${data.updatedCount} listings`);
        onOperationComplete?.();
      } else {
        showError(data.error || 'Archiving failed');
      }
    } catch (error) {
      showError('Error archiving listings');
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
        showSuccess(`✓ Deleted ${data.deletedCount} listings`);
        onOperationComplete?.();
      } else {
        showError(data.error || 'Deletion failed');
      }
    } catch (error) {
      showError('Error deleting listings');
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
