"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<{ success: boolean; needsEmailConfirmation: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face";

const STORAGE_KEY = "nestfinder_mock_users";
const SESSION_KEY = "nestfinder_mock_session";

// Local, in-memory/localStorage "database" — no backend involved.
// Seeded with one admin account so /admin is reachable out of the box.
interface StoredUser extends User {
  password: string;
}

const SEED_USERS: StoredUser[] = [
  {
    id: "admin-1",
    name: "Admin",
    email: "admin@nestfinder.com",
    phone: "+216 20 000 000",
    avatar: DEFAULT_AVATAR,
    role: "admin",
    password: "admin123",
  },
];

function loadUsers(): StoredUser[] {
  if (typeof window === "undefined") return SEED_USERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return SEED_USERS;
  }
}

function saveUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function toPublicUser(u: StoredUser): User {
  const { password: _password, ...rest } = u;
  return rest;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first load (page refresh, new tab, etc.)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const savedId = JSON.parse(raw) as string;
        const users = loadUsers();
        const found = users.find((u) => u.id === savedId);
        if (found) setUser(toPublicUser(found));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return false;
    setUser(toPublicUser(found));
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(found.id));
    return true;
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<{ success: boolean; needsEmailConfirmation: boolean; message?: string }> => {
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, needsEmailConfirmation: false, message: "An account with this email already exists." };
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      avatar: DEFAULT_AVATAR,
      role: "user",
      password,
    };

    const updated = [...users, newUser];
    saveUsers(updated);
    setUser(toPublicUser(newUser));
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(newUser.id));

    return { success: true, needsEmailConfirmation: false };
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);

    const users = loadUsers();
    const nextUsers = users.map((u) => (u.id === user.id ? { ...u, ...data } : u));
    saveUsers(nextUsers);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
