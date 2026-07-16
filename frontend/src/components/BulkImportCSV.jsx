import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { showToast } from './Toast/Toast';

export default function BulkImportCSV({ onImportSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);
  const authToken = useAuthStore((s) => s.token);

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/listings/bulk/csv-template', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'listings-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showToast('Failed to download template', 'error');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    if (!file.name.endsWith('.csv')) {
      showToast('Please upload a CSV file', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/listings/bulk/csv-validate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPreviewData(data);
        showToast(`Validated ${data.validRecords} records`, 'success');
      } else {
        showToast(data.error || 'Validation failed', 'error');
      }
    } catch (error) {
      showToast('Error processing file', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      showToast('Please select a file', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);

    try {
      const response = await fetch('/api/listings/bulk/csv-import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showToast(`Imported ${data.imported} listings successfully`, 'success');
        onImportSuccess?.();
        onClose?.();
      } else {
        showToast(data.error || 'Import failed', 'error');
      }
    } catch (error) {
      showToast('Error importing file', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📥 Bulk Import CSV</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={handleDownloadTemplate}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            📋 Download CSV Template
          </button>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
            >
              Choose File or Drag & Drop
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              CSV files only
            </p>
          </div>

          {previewData && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">✓ Validation Preview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Valid records: <span className="font-semibold text-green-600">{previewData.validRecords}</span>
              </p>
              {previewData.invalidRecords > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Invalid records: <span className="font-semibold text-red-600">{previewData.invalidRecords}</span>
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading || !previewData}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition"
            >
              {loading ? '⏳ Importing...' : '✓ Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
