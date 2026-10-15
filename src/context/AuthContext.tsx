import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "../types";
import { getAuthUser, saveAuthUser, clearAuthUser } from "../services/authStorage";
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  googleLoginUser as apiGoogleLogin,
} from "../config/api";

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, phone: string, pass: string, email?: string) => Promise<{ success: boolean; message?: string }>;
  loginGoogle: (idToken: string, profile?: { name?: string; email?: string; photoURL?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  loginGoogle: async () => ({ success: false }),
  logout: async () => {},
  updateUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from AsyncStorage upon startup
  useEffect(() => {
    let isMounted = true;
    getAuthUser().then((user) => {
      if (isMounted) {
        setCurrentUser(user);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await apiLogin(identifier, pass);
    if (res.success && res.data) {
      const userObj: UserProfile = {
        ...res.data,
        displayName: res.data.displayName || res.data.name,
      };
      setCurrentUser(userObj);
      await saveAuthUser(userObj);
      return { success: true };
    }
    return { success: false, message: res.message || "Failed to log in" };
  };

  const register = async (name: string, phone: string, pass: string, email?: string) => {
    const res = await apiRegister(name, phone, pass, email);
    if (res.success && res.data) {
      const userObj: UserProfile = {
        ...res.data,
        displayName: res.data.displayName || res.data.name,
      };
      setCurrentUser(userObj);
      await saveAuthUser(userObj);
      return { success: true };
    }
    return { success: false, message: res.message || "Failed to register" };
  };

  const loginGoogle = async (
    idToken: string,
    profile?: { name?: string; email?: string; photoURL?: string }
  ) => {
    const res = await apiGoogleLogin(idToken, profile);
    if (res.success && res.data) {
      const userObj: UserProfile = {
        ...res.data,
        displayName: res.data.displayName || res.data.name || profile?.name,
      };
      setCurrentUser(userObj);
      await saveAuthUser(userObj);
      return { success: true };
    }
    return { success: false, message: res.message || "Failed to authenticate with Google" };
  };

  const logout = async () => {
    setCurrentUser(null);
    await clearAuthUser();
  };

  const updateUser = async (user: UserProfile) => {
    setCurrentUser(user);
    await saveAuthUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        loginGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
