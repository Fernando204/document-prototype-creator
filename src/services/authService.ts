// Auth API service — ready for backend integration
// Replace simulateRequest calls with real HTTP requests when API is available

import { simulateRequest, getStorageData, setStorageData } from "./api";

const API_BASE = "/api"; // Change to real API base URL

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  farmName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  farmName: string;
  avatar?: string;
  role: "admin" | "colaborador";
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

// POST /auth/register
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  // TODO: Replace with real API call
  // return fetch(`${API_BASE}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json());

  return simulateRequest(() => {
    const users = getStorageData<AuthUser[]>("hc_users", []);

    const emailExists = users.some(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (emailExists) {
      return { success: false, error: "Este e-mail já está cadastrado." };
    }

    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      farmName: payload.farmName,
      role: "admin",
      createdAt: new Date().toISOString(),
    };

    // Store password (simple base64 for local demo)
    const passwords = getStorageData<Record<string, string>>("hc_passwords", {});
    passwords[newUser.id] = btoa(payload.password);
    setStorageData("hc_passwords", passwords);

    setStorageData("hc_users", [...users, newUser]);

    return { success: true, user: newUser, token: `demo-token-${newUser.id}` };
  });
}

// POST /auth/login
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  // TODO: Replace with real API call
  // return fetch(`${API_BASE}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json());

  return simulateRequest(() => {
    const users = getStorageData<AuthUser[]>("hc_users", []);
    const user = users.find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase()
    );

    if (!user) {
      return { success: false, error: "E-mail ou senha incorretos." };
    }

    const passwords = getStorageData<Record<string, string>>("hc_passwords", {});
    if (passwords[user.id] !== btoa(payload.password)) {
      return { success: false, error: "E-mail ou senha incorretos." };
    }

    return { success: true, user, token: `demo-token-${user.id}` };
  });
}
