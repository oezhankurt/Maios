import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';

export default function ListingExportPanel({ onClose }) {
  const [exporting, setExporting] = useState(false);
  const authToken = useAuthStore((s) => s.token);
  const { success: showSuccess, error: showError } = useToast();

  const handleExport = async (format, type = null) => {
    setExporting(true);
    try {
      let url = `/api/listings/export/${format}`;
      if (type) url += `/${type}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (format === 'csv' || format === 'json') {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `listings.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        showSuccess(`✓ ${format.toUpperCase()} exported successfully`);
      } else {
        const data = await response.json();
        if (data.success) {
          showSuccess('✓ Report generated successfully');
        }
      }
    } catch (error) {
      showError('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">📤 Export Listings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">📊 Data Formats</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition text-left"
              >
                {exporting ? '⏳ Exporting...' : '📥 Export as CSV'}
              </button>
              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition text-left"
              >
                {exporting ? '⏳ Exporting...' : '📥 Export as JSON'}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">📈 Reports</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleExport('report', 'pdf')}
                disabled={exporting}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition text-left"
              >
                {exporting ? '⏳ Generating...' : '📄 Summary Report'}
              </button>
              <button
                onClick={() => handleExport('report', 'performance')}
                disabled={exporting}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition text-left"
              >
                {exporting ? '⏳ Generating...' : '📊 Performance Report'}
              </button>
              <button
                onClick={() => handleExport('report', 'optimization')}
                disabled={exporting}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition text-left"
              >
                {exporting ? '⏳ Generating...' : '🎯 Optimization Report'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg text-sm text-blue-900 dark:text-blue-100">
            ℹ️ CSV and JSON files are downloaded directly. Reports are displayed in your browser.
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
