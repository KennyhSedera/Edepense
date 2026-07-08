import React, { createContext, useContext, useEffect, useState } from "react";

import { UserConnected } from "@/types/db";
import { getLocalUser, isLoggedIn, removeLocalToken } from "@/utils/token.util";
import { loginController, updateUserController } from "@/controller/user.controller";
import { cancelDailyReminder } from "@/services/notificationService";

type AuthContextType = {
  user: UserConnected | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string | { email?: string; password?: string } }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<UserConnected>) => Promise<{ success: boolean; error?: string; message?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserConnected | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bootstrap = async () => {
    setIsLoading(true);
    const loggedIn = await isLoggedIn();
    if (loggedIn) {
      const localUser = await getLocalUser();
      setUser(localUser);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginController(email, password);
    if (result.success) {
      const localUser = await getLocalUser();
      setUser(localUser);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    if (user) {
      await cancelDailyReminder(user.id);
    }
    await removeLocalToken();
    setUser(null);
  };

  const refreshUser = async () => {
    const localUser = await getLocalUser();
    setUser(localUser);
  };

  const updateUser = async (data: Partial<UserConnected>) => {
    if (!user) return { success: false, error: "Aucun utilisateur connecté" };

    const result = await updateUserController(user.id, data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    await refreshUser();

    return { success: true, message: result.message };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}