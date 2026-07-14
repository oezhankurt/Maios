import { create } from 'zustand';
import { DashboardAPI, ProductAPI } from '../api/api';

export const useDashboardStore = create((set) => ({
  overview: null,
  chart: [],
  topProducts: [],
  alerts: [],
  products: [],
  loading: false,
  error: null,

  async loadAll(days = 30) {
    set({ loading: true, error: null });
    try {
      const [overview, chart, topProducts, alerts, products] = await Promise.all([
        DashboardAPI.overview(),
        DashboardAPI.profitChart({ days }),
        DashboardAPI.topProducts({ limit: 5 }),
        DashboardAPI.alerts({ status: 'active' }),
        ProductAPI.list(),
      ]);
      set({ overview, chart, topProducts, alerts, products, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  async dismissAlert(id) {
    await DashboardAPI.dismissAlert(id);
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
  },
}));
