import { createContext, useState, useEffect, useContext } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";

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
      const saved = await SecureStore.getItemAsync("theme");
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
    await SecureStore.setItemAsync("theme", newTheme); // persiste le choix
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