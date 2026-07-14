import { create } from 'zustand';
import { AuthAPI } from '../api/api';

const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('maios_user')) || null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create((set, get) => ({
  user: storedUser,
  token: localStorage.getItem('maios_token') || null,
  isAuthenticated: Boolean(localStorage.getItem('maios_token')),
  loading: false,
  error: null,

  _persist(user, token) {
    localStorage.setItem('maios_token', token);
    localStorage.setItem('maios_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, error: null });
  },

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const { user, token } = await AuthAPI.login({ email, password });
      get()._persist(user, token);
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  async register(payload) {
    set({ loading: true, error: null });
    try {
      const { user, token } = await AuthAPI.register(payload);
      get()._persist(user, token);
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  async refresh() {
    if (!get().token) return;
    try {
      const user = await AuthAPI.me();
      localStorage.setItem('maios_user', JSON.stringify(user));
      set({ user });
    } catch {
      get().logout();
    }
  },

  logout() {
    AuthAPI.logout().catch(() => {});
    localStorage.removeItem('maios_token');
    localStorage.removeItem('maios_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
