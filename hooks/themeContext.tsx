import {
  DarkTheme,
  DefaultTheme,
  Theme,
} from "@react-navigation/native";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { STORAGE_THEME_KEY } from "@/constants/storage";
import { User } from "@/types/db";
import { getUser } from "@/db/user";

export type ThemeType = "light" | "dark";

type ThemeContextType = {
  theme: ThemeType;
  toggleTheme: () => void;
  setThemeMode: (t: ThemeType) => void;
  navigationTheme: Theme;
  isLoading: boolean;
  user: User | null;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemTheme = useSystemColorScheme();
  const [theme, setTheme] = useState<ThemeType>("light");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_THEME_KEY);
        const user = await getUser();

        if (user !== null) {
          setUser(user);
        }
        if (saved === null) {
          await AsyncStorage.setItem(STORAGE_THEME_KEY, systemTheme === "dark" ? "dark" : "light");
          setTheme(systemTheme === "dark" ? "dark" : "light");
          return;
        }

        if (saved === "light" || saved === "dark") {
          setTheme(saved);
        } else {
          setTheme(systemTheme === "dark" ? "dark" : "light");
        }
      } catch (e) {
        setTheme("light");
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [systemTheme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const setThemeMode = async (t: ThemeType) => {
    setTheme(t);
    await AsyncStorage.setItem(STORAGE_THEME_KEY, t);
  };

  const navigationTheme = theme === "light" ? DefaultTheme : DarkTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setThemeMode,
        navigationTheme,
        isLoading,
        user
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useAppTheme must be used inside AppThemeProvider"
    );
  }

  return context;
};