import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from '../theme/theme.js';
import { settingService } from '../services/settingService.js';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  effectiveMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('erp_theme_mode') as ThemeMode;
    return saved || 'light';
  });

  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    const saved = localStorage.getItem('erp_primary_color');
    return saved || '#0284c7';
  });

  // Calculate actual effective mode (handling 'system')
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const effectiveMode: 'light' | 'dark' = useMemo(() => {
    if (themeMode === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemPrefersDark]);

  // Sync settings from backend on load
  useEffect(() => {
    settingService
      .getSystemSettings()
      .then((res) => {
        if (res?.settings) {
          if (res.settings.themeMode && !localStorage.getItem('erp_theme_mode')) {
            setThemeModeState(res.settings.themeMode);
            localStorage.setItem('erp_theme_mode', res.settings.themeMode);
          }
          if (res.settings.primaryColor && !localStorage.getItem('erp_primary_color')) {
            setPrimaryColorState(res.settings.primaryColor);
            localStorage.setItem('erp_primary_color', res.settings.primaryColor);
          }
        }
      })
      .catch(() => {});
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('erp_theme_mode', mode);
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem('erp_primary_color', color);
  };

  // Generate MUI theme dynamically
  const theme = useMemo(() => {
    return getAppTheme(effectiveMode, primaryColor);
  }, [effectiveMode, primaryColor]);

  // Keep html class or body attribute in sync for dark mode styles
  useEffect(() => {
    if (effectiveMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [effectiveMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        primaryColor,
        setPrimaryColor,
        effectiveMode,
      }}
    >
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within CustomThemeProvider');
  }
  return context;
};
