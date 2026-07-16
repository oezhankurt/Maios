import { createContext, useCallback, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    if (saved) return saved === 'dark';

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme-mode', 'light');
    }
  }, [isDark]);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const setDark = useCallback((dark) => {
    setIsDark(dark);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
