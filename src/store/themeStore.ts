import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  
  toggleTheme: () => {
    set((state) => {
      const newIsDark = !state.isDark;
      
      // Aplica classe no document
      if (typeof document !== 'undefined') {
        if (newIsDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      // Persiste no localStorage
      try {
        localStorage.setItem('appliquei_theme', newIsDark ? 'dark' : 'light');
      } catch (_) {}
      
      return { isDark: newIsDark };
    });
  },
  
  setTheme: (isDark: boolean) => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    try {
      localStorage.setItem('appliquei_theme', isDark ? 'dark' : 'light');
    } catch (_) {}
    
    set({ isDark });
  },
}));

/**
 * Inicializa o tema baseado no localStorage ou preferência do sistema
 */
export function initTheme(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const saved = localStorage.getItem('appliquei_theme');
    if (saved) {
      const isDark = saved === 'dark';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return isDark;
    }
  } catch (_) {}
  
  // Fallback: preferência do sistema
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.classList.add('dark');
  }
  
  return prefersDark;
}
