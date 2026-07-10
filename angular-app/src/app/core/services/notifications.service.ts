import { Injectable, signal } from '@angular/core';
import { AppNotification } from '../models';

const NOTIFICATIONS_KEY = 're_notifications';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly _all = signal<AppNotification[]>([]);
  readonly all = this._all.asReadonly();

  constructor() {
    this._all.set(this.readAll());
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === NOTIFICATIONS_KEY) this._all.set(this.readAll());
      });
    }
  }

  private readAll(): AppNotification[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(NOTIFICATIONS_KEY);
      return raw ? (JSON.parse(raw) as AppNotification[]) : [];
    } catch {
      return [];
    }
  }

  private writeAll(next: AppNotification[]) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
  }

  notificationsFor(userId: string | null): AppNotification[] {
    if (!userId) return [];
    return this._all()
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  unreadCountFor(userId: string | null): number {
    return this.notificationsFor(userId).filter((n) => !n.read).length;
  }

  addNotification(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const notification: AppNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const next = [notification, ...this.readAll()];
    this.writeAll(next);
    this._all.set(next);
  }

  markRead(id: string) {
    const next = this.readAll().map((n) => (n.id === id ? { ...n, read: true } : n));
    this.writeAll(next);
    this._all.set(next);
  }

  markAllRead(userId: string | null) {
    if (!userId) return;
    const next = this.readAll().map((n) => (n.userId === userId ? { ...n, read: true } : n));
    this.writeAll(next);
    this._all.set(next);
  }
}
