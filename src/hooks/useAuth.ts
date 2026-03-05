import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";
import { loginUser, registerUser, type AuthUser } from "@/services/authService";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token?: string;
}

export function useAuth() {
  const [auth, setAuth] = useLocalStorage<AuthState>("hc_auth", {
    user: null,
    isAuthenticated: false,
  });

  const register = useCallback(
    async (name: string, email: string, phone: string, password: string, farmName: string) => {
      const result = await registerUser({ name, email, phone, password, farmName });
      if (result.success && result.user) {
        setAuth({ user: result.user, isAuthenticated: true, token: result.token });
      }
      return result;
    },
    [setAuth]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginUser({ email, password });
      if (result.success && result.user) {
        setAuth({ user: result.user, isAuthenticated: true, token: result.token });
      }
      return result;
    },
    [setAuth]
  );

  const logout = useCallback(() => {
    setAuth({ user: null, isAuthenticated: false });
  }, [setAuth]);

  const updateProfile = useCallback(
    (updates: Partial<AuthUser>) => {
      if (!auth.user) return;
      const updatedUser = { ...auth.user, ...updates };
      setAuth({ ...auth, user: updatedUser });
    },
    [auth, setAuth]
  );

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    token: auth.token,
    register,
    login,
    logout,
    updateProfile,
  };
}

export type { AuthUser as User };
