import { createContext, useState, useEffect, useContext } from "react";
import { useColorScheme, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// expo-secure-store has no web implementation; fall back to localStorage
// there so theme persistence (and the dev error overlay) doesn't break on web.
const ThemeStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") return globalThis.localStorage?.getItem(key) ?? null;
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
};

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [theme, setThemeState] = useState<ThemeType>("light");

  // Au lancement : charge le thème sauvegardé, sinon utilise le système
  useEffect(() => {
    const loadTheme = async () => {
      const saved = await ThemeStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      } else {
        setThemeState(systemScheme === "dark" ? "dark" : "light");
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    await ThemeStorage.setItem("theme", newTheme); // persiste le choix
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook avec guard — plante proprement si utilisé hors du Provider
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme doit être utilisé dans un ThemeProvider");
  return context;
};