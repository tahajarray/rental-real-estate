import { Injectable } from '@angular/core';
import { AuditLogEntry } from '../models';

const AUDIT_KEY = 'nestfinder_audit_logs';
const MAX_ENTRIES = 500;

@Injectable({ providedIn: 'root' })
export class AuditService {
  readonly actionLabels: Record<AuditLogEntry['action'], string> = {
    worker_created: 'Created worker account',
    worker_activated: 'Activated worker account',
    worker_deactivated: 'Deactivated worker account',
    login_blocked_inactive: 'Blocked login (deactivated worker)',
    estate_created: 'Added new listing',
    estate_deleted: 'Deleted listing',
    estate_status_changed: 'Changed listing status',
  };

  getLogs(): AuditLogEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(AUDIT_KEY);
      return raw ? (JSON.parse(raw) as AuditLogEntry[]) : [];
    } catch {
      return [];
    }
  }

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    if (typeof window === 'undefined') return;
    const logs = this.getLogs();
    const next: AuditLogEntry[] = [
      {
        ...entry,
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
      },
      ...logs,
    ].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify(next));
  }
}
