import { create } from 'zustand';

// Global UI filters shared across pages (date range, selected product, market).
export const useFilterStore = create((set) => ({
  dateRange: 30, // days
  selectedProduct: null,
  marketplace: 'amazon',

  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  setMarketplace: (marketplace) => set({ marketplace }),
}));
