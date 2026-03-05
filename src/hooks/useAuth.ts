import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";
import { registerUser } from "@../services/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  farm?: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [users, setUsers] = useLocalStorage<User[]>("hc_users", []);
  const [auth, setAuth] = useLocalStorage<AuthState>("hc_auth", {
    user: null,
    isAuthenticated: false,
  });

  const register = useCallback(
    async (name: string, phone: string, email: string, password: string, harasName: string) => {
      try {
        const response = await registerUser({
          name,
          email,
          password,
        });

        const user: User = response.user;

        setUsers([...users, user]);
        setAuth({ user, isAuthenticated: true });

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [users, setUsers, setAuth],
  );

  const login = useCallback(
    (email: string, password: string) => {
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return { success: false, error: "E-mail ou senha incorretos." };
      }

      const passwords = JSON.parse(localStorage.getItem("hc_passwords") || "{}");
      if (passwords[user.id] !== btoa(password)) {
        return { success: false, error: "E-mail ou senha incorretos." };
      }

      setAuth({ user, isAuthenticated: true });
      return { success: true };
    },
    [users, setAuth],
  );

  const logout = useCallback(() => {
    setAuth({ user: null, isAuthenticated: false });
  }, [setAuth]);

  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      if (!auth.user) return;
      const updatedUser = { ...auth.user, ...updates };
      setAuth({ ...auth, user: updatedUser });
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    },
    [auth, setAuth, users, setUsers],
  );

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
  };
}
