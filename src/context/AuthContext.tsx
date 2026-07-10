"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { logAudit } from "@/lib/audit";

export type Role = "user" | "worker" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: Role;
  // Only ever set for workers — the single admin they report to.
  // Must be undefined/absent for "user" and "admin" roles.
  adminId?: string;
  // Only meaningful for workers. Defaults to true. Admin can flip this to
  // revoke a worker's access without deleting the account.
  active?: boolean;
}

interface ActionResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<{ success: boolean; needsEmailConfirmation: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;

  // --- Admin-only account management -------------------------------
  // Every one of these re-checks `user.role === "admin"` internally, so
  // even if a component forgets to gate its UI, the action itself refuses
  // to run for anyone else. This is the client-side stand-in for an API
  // guard in a real backend.
  createWorker: (name: string, email: string, phone: string, password: string) => Promise<ActionResult>;
  setWorkerActive: (workerId: string, active: boolean) => Promise<ActionResult>;
  getWorkers: () => User[];
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face";

const STORAGE_KEY = "nestfinder_mock_users";
const SESSION_KEY = "nestfinder_mock_session";

// Local, in-memory/localStorage "database" — no backend involved.
interface StoredUser extends User {
  password: string;
}

// There is exactly one admin in this system. No signup or worker flow
// ever creates a second one — this is the "single hierarchy" invariant.
const ADMIN_ID = "admin-1";

const SEED_USERS: StoredUser[] = [
  {
    id: ADMIN_ID,
    name: "Admin",
    email: "admin@nestfinder.com",
    phone: "+216 20 000 001",
    avatar: DEFAULT_AVATAR,
    role: "admin",
    password: "admin123",
  },
  {
    id: "worker-1",
    name: "Worker",
    email: "worker@nestfinder.com",
    phone: "+216 20 000 000",
    avatar: DEFAULT_AVATAR,
    role: "worker",
    adminId: ADMIN_ID,
    active: true,
    password: "worker123",
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

// The one active admin in the system. Everything worker-related is
// anchored off this record.
function getAdmin(users: StoredUser[]): StoredUser | undefined {
  return users.find((u) => u.role === "admin");
}

function isAccountUsable(u: StoredUser): boolean {
  // Only workers can be deactivated; users/admin are always usable.
  return u.role !== "worker" || u.active !== false;
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
        if (found && isAccountUsable(found)) {
          setUser(toPublicUser(found));
        } else {
          window.localStorage.removeItem(SESSION_KEY);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return null;

    if (!isAccountUsable(found)) {
      logAudit({
        actorId: found.id,
        actorName: found.name,
        actorRole: found.role,
        action: "login_blocked_inactive",
        details: "Login attempt on a deactivated worker account.",
      });
      return null;
    }

    const publicUser = toPublicUser(found);
    setUser(publicUser);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(found.id));
    return publicUser;
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

    // Public signup only ever creates plain "user" accounts. There is no
    // public path to becoming an worker or admin.
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
    // Let other contexts know a logout happened, in case anything reacts to
    // it before the redirect below takes effect.
    window.dispatchEvent(new Event("nestfinder:logout"));
    // A hard redirect (not router.push) fully reloads the app, so every
    // context resets from scratch — this is what guarantees nothing from
    // the previous session (compare list, saved items, form state, etc.)
    // can leak into the next login on the same browser.
    window.location.href = "/login";
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    // Hard block: profile self-service can never touch role/hierarchy/status
    // fields, regardless of who's calling it or what's passed in. This is
    // what enforces "worker cannot change their admin link."
    const { role: _role, adminId: _adminId, active: _active, id: _id, ...safeData } = data;

    const updated = { ...user, ...safeData };
    setUser(updated);

    const users = loadUsers();
    const nextUsers = users.map((u) => (u.id === user.id ? { ...u, ...safeData } : u));
    saveUsers(nextUsers);
  };

  // --- Admin-only management --------------------------------------

  const createWorker = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<ActionResult> => {
    if (!user || user.role !== "admin") {
      return { success: false, message: "Only the admin can create worker accounts." };
    }

    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "An account with this email already exists." };
    }

    const admin = getAdmin(users);
    if (!admin) {
      return { success: false, message: "No active admin found in the system." };
    }

    const newWorker: StoredUser = {
      id: `worker-${Date.now()}`,
      name,
      email,
      phone,
      avatar: DEFAULT_AVATAR,
      role: "worker",
      adminId: admin.id,
      active: true,
      password,
    };

    saveUsers([...users, newWorker]);
    logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "worker_created",
      targetId: newWorker.id,
      targetName: newWorker.name,
      details: newWorker.email,
    });

    return { success: true };
  };

  const setWorkerActive = async (workerId: string, active: boolean): Promise<ActionResult> => {
    if (!user || user.role !== "admin") {
      return { success: false, message: "Only the admin can activate or deactivate workers." };
    }

    const users = loadUsers();
    const target = users.find((u) => u.id === workerId && u.role === "worker");
    if (!target) {
      return { success: false, message: "Worker not found." };
    }

    const updated = users.map((u) => (u.id === workerId ? { ...u, active } : u));
    saveUsers(updated);
    logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: active ? "worker_activated" : "worker_deactivated",
      targetId: target.id,
      targetName: target.name,
    });

    return { success: true };
  };

  const getWorkers = (): User[] => {
    const users = loadUsers();
    const admin = getAdmin(users);
    if (!admin) return [];
    return users
      .filter((u) => u.role === "worker" && u.adminId === admin.id)
      .map(toPublicUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateProfile, createWorker, setWorkerActive, getWorkers }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
