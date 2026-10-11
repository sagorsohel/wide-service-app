import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Appearance, useColorScheme as useRNColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

export type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "@wide_service_theme_mode";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  colors: {
    bg: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    borderSubtle: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    primary: string;
    navBg: string;
    card: string;
    icon: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useRNColorScheme();
  const { setColorScheme: setNWColorScheme } = useNativeWindColorScheme();

  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [isReady, setIsReady] = useState(false);

  // Determine if dark is active based on mode and system preference
  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemScheme === "dark");

  // Sync with NativeWind colorScheme whenever isDark changes
  useEffect(() => {
    try {
      setNWColorScheme(isDark ? "dark" : "light");
    } catch (e) {
      // safe fallback
    }
  }, [isDark, setNWColorScheme]);

  // Load saved theme preference on mount
  useEffect(() => {
    let isMounted = true;
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
          if (isMounted) {
            setThemeModeState(saved as ThemeMode);
            const activeDark =
              saved === "dark" ||
              (saved === "system" && Appearance.getColorScheme() === "dark");
            setNWColorScheme(activeDark ? "dark" : "light");
          }
        }
      } catch (e) {
        console.warn("[ThemeContext] Error loading theme:", e);
      } finally {
        if (isMounted) setIsReady(true);
      }
    }
    loadTheme();
    return () => {
      isMounted = false;
    };
  }, [setNWColorScheme]);

  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      try {
        setThemeModeState(mode);
        const activeDark =
          mode === "dark" ||
          (mode === "system" && (systemScheme === "dark" || Appearance.getColorScheme() === "dark"));
        setNWColorScheme(activeDark ? "dark" : "light");
        await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch (e) {
        console.warn("[ThemeContext] Error saving theme:", e);
      }
    },
    [systemScheme, setNWColorScheme]
  );

  const toggleTheme = useCallback(async () => {
    const nextMode: ThemeMode = isDark ? "light" : "dark";
    await setThemeMode(nextMode);
  }, [isDark, setThemeMode]);

  // Comprehensive theme token colors
  const colors = {
    bg: isDark ? "#090d16" : "#f8fafc",
    surface: isDark ? "#131b2e" : "#ffffff",
    surfaceAlt: isDark ? "#1b253b" : "#f1f5f9",
    border: isDark ? "#24324d" : "#e2e8f0",
    borderSubtle: isDark ? "#1e2a42" : "#f1f5f9",
    text: isDark ? "#f8fafc" : "#0f172a",
    textMuted: isDark ? "#94a3b8" : "#64748b",
    textSubtle: isDark ? "#64748b" : "#94a3b8",
    primary: "#e0b328",
    navBg: isDark ? "#0f172a" : "#ffffff",
    card: isDark ? "#131b2e" : "#ffffff",
    icon: isDark ? "#cbd5e1" : "#475569",
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        setThemeMode,
        toggleTheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      themeMode: "light",
      isDark: false,
      setThemeMode: async () => {},
      toggleTheme: async () => {},
      colors: {
        bg: "#f8fafc",
        surface: "#ffffff",
        surfaceAlt: "#f1f5f9",
        border: "#e2e8f0",
        borderSubtle: "#f1f5f9",
        text: "#0f172a",
        textMuted: "#64748b",
        textSubtle: "#94a3b8",
        primary: "#e0b328",
        navBg: "#ffffff",
        card: "#ffffff",
        icon: "#475569",
      },
    };
  }
  return context;
}
