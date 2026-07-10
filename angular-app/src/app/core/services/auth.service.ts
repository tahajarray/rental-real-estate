import { Injectable, computed, signal } from '@angular/core';
import { StoredUser, User } from '../models';
import { AuditService } from './audit.service';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face';
const STORAGE_KEY = 'nestfinder_mock_users';
const SESSION_KEY = 'nestfinder_mock_session';
const ADMIN_ID = 'admin-1';

const SEED_USERS: StoredUser[] = [
  {
    id: ADMIN_ID,
    name: 'Admin',
    email: 'admin@nestfinder.com',
    phone: '+216 20 000 001',
    avatar: DEFAULT_AVATAR,
    role: 'admin',
    password: 'admin123',
  },
  {
    id: 'worker-1',
    name: 'Worker',
    email: 'worker@nestfinder.com',
    phone: '+216 20 000 000',
    avatar: DEFAULT_AVATAR,
    role: 'worker',
    adminId: ADMIN_ID,
    active: true,
    password: 'worker123',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(null);
  private readonly _loading = signal(true);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  constructor(private readonly audit: AuditService) {
    this.restoreSession();
  }

  private loadUsers(): StoredUser[] {
    if (typeof window === 'undefined') return SEED_USERS;
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

  private saveUsers(users: StoredUser[]) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  private toPublicUser(u: StoredUser): User {
    const { password: _password, ...rest } = u;
    return rest;
  }

  private isAccountUsable(u: StoredUser) {
    return u.role !== 'worker' || u.active !== false;
  }

  private restoreSession() {
    if (typeof window === 'undefined') {
      this._loading.set(false);
      return;
    }
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const id = JSON.parse(raw) as string;
        const found = this.loadUsers().find((u) => u.id === id);
        if (found && this.isAccountUsable(found)) {
          this._user.set(this.toPublicUser(found));
        } else {
          window.localStorage.removeItem(SESSION_KEY);
        }
      }
    } finally {
      this._loading.set(false);
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    const found = this
      .loadUsers()
      .find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return null;

    if (!this.isAccountUsable(found)) {
      this.audit.log({
        actorId: found.id,
        actorName: found.name,
        actorRole: found.role,
        action: 'login_blocked_inactive',
        details: 'Login attempt on a deactivated worker account.',
      });
      return null;
    }

    const user = this.toPublicUser(found);
    this._user.set(user);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(found.id));
    }
    return user;
  }

  async signup(name: string, email: string, phone: string, password: string) {
    const users = this.loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, needsEmailConfirmation: false, message: 'An account with this email already exists.' };
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      avatar: DEFAULT_AVATAR,
      role: 'user',
      password,
    };

    this.saveUsers([...users, newUser]);
    this._user.set(this.toPublicUser(newUser));
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(newUser.id));
    }

    return { success: true, needsEmailConfirmation: false };
  }

  logout() {
    this._user.set(null);
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('nestfinder:logout'));
  }

  async updateProfile(data: Partial<User>) {
    const current = this._user();
    if (!current) return;

    const { role: _role, adminId: _adminId, active: _active, id: _id, ...safeData } = data;
    const updated = { ...current, ...safeData };
    this._user.set(updated);

    const users = this.loadUsers();
    this.saveUsers(users.map((u) => (u.id === current.id ? { ...u, ...safeData } : u)));
  }

  async createWorker(name: string, email: string, phone: string, password: string) {
    const current = this._user();
    if (!current || current.role !== 'admin') {
      return { success: false, message: 'Only the admin can create worker accounts.' };
    }

    const users = this.loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const admin = users.find((u) => u.role === 'admin');
    if (!admin) return { success: false, message: 'No active admin found in the system.' };

    const worker: StoredUser = {
      id: `worker-${Date.now()}`,
      name,
      email,
      phone,
      avatar: DEFAULT_AVATAR,
      role: 'worker',
      adminId: admin.id,
      active: true,
      password,
    };

    this.saveUsers([...users, worker]);
    this.audit.log({
      actorId: current.id,
      actorName: current.name,
      actorRole: current.role,
      action: 'worker_created',
      targetId: worker.id,
      targetName: worker.name,
      details: worker.email,
    });
    return { success: true };
  }

  async setWorkerActive(workerId: string, active: boolean) {
    const current = this._user();
    if (!current || current.role !== 'admin') {
      return { success: false, message: 'Only the admin can activate or deactivate workers.' };
    }

    const users = this.loadUsers();
    const target = users.find((u) => u.id === workerId && u.role === 'worker');
    if (!target) return { success: false, message: 'Worker not found.' };

    this.saveUsers(users.map((u) => (u.id === workerId ? { ...u, active } : u)));
    this.audit.log({
      actorId: current.id,
      actorName: current.name,
      actorRole: current.role,
      action: active ? 'worker_activated' : 'worker_deactivated',
      targetId: target.id,
      targetName: target.name,
    });
    return { success: true };
  }

  getWorkers(): User[] {
    const users = this.loadUsers();
    const admin = users.find((u) => u.role === 'admin');
    if (!admin) return [];
    return users
      .filter((u) => u.role === 'worker' && u.adminId === admin.id)
      .map((u) => this.toPublicUser(u));
  }
}
