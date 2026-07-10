// Lightweight audit-log utility.
//
// This app has no backend, so "audit logs" are stored in localStorage just
// like the mock user database in AuthContext. In a real system this would be
// an append-only table written to by the API layer whenever a worker/admin
// action occurs, but the shape (actor, action, target, timestamp) is the same.

export type AuditAction =
  | "worker_created"
  | "worker_activated"
  | "worker_deactivated"
  | "login_blocked_inactive"
  | "estate_created"
  | "estate_deleted"
  | "estate_status_changed";

export type ActorRole = "user" | "worker" | "admin";

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  actorId: string;
  actorName: string;
  actorRole: ActorRole;
  action: AuditAction;
  targetId?: string;
  targetName?: string;
  details?: string;
}

const AUDIT_KEY = "nestfinder_audit_logs";
const MAX_ENTRIES = 500;

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    return raw ? (JSON.parse(raw) as AuditLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function logAudit(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  const logs = getAuditLogs();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newEntry, ...logs].slice(0, MAX_ENTRIES);
  window.localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  worker_created: "Created worker account",
  worker_activated: "Activated worker account",
  worker_deactivated: "Deactivated worker account",
  login_blocked_inactive: "Blocked login (deactivated worker)",
  estate_created: "Added new listing",
  estate_deleted: "Deleted listing",
  estate_status_changed: "Changed listing status",
};
