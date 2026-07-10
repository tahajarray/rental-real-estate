import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationsService } from '../../core/services/notifications.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="nav">
      <a routerLink="/" class="brand">NestFinder</a>
      <nav>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/explore" routerLinkActive="active">Explore</a>
        <a routerLink="/saved" routerLinkActive="active">Saved</a>
        <a routerLink="/contact" routerLinkActive="active">Contact</a>
      </nav>
      <div class="right" *ngIf="auth.user() as user; else guest">
        <button class="notif" title="Notifications" (click)="markAllRead()">🔔 <span *ngIf="unreadCount()">{{ unreadCount() }}</span></button>
        <select (change)="onMenu($event)">
          <option>{{ user.name }}</option>
          <option value="profile">Profile</option>
          <option *ngIf="user.role === 'worker' || user.role === 'admin'" value="worker">Worker Dashboard</option>
          <option *ngIf="user.role === 'admin'" value="admin">Admin Dashboard</option>
          <option value="logout">Logout</option>
        </select>
      </div>
      <ng-template #guest>
        <div class="right">
          <button (click)="router.navigate(['/login'])">Login</button>
          <button class="primary" (click)="router.navigate(['/signup'])">Sign Up</button>
        </div>
      </ng-template>
    </header>
  `,
  styles: [
    `
      .nav { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 16px; background: #fff; border-bottom: 1px solid #e2e8f0; }
      .brand { font-weight: 700; color: #1f2937; text-decoration: none; }
      nav { display: flex; gap: 8px; }
      nav a { text-decoration: none; color: #64748b; padding: 6px 10px; border-radius: 8px; }
      nav a.active { background: #eff6ff; color: #2563eb; }
      .right { display: flex; gap: 8px; align-items: center; }
      button, select { border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; background: #fff; }
      .primary { background: #2563eb; color: #fff; border-color: #2563eb; }
      .notif span { color: #ef4444; font-weight: 700; }
      @media (max-width: 900px) { nav { display: none; } }
    `,
  ],
})
export class NavbarComponent {
  readonly unreadCount = computed(() => this.notifications.unreadCountFor(this.auth.user()?.id ?? null));

  constructor(
    public readonly auth: AuthService,
    private readonly notifications: NotificationsService,
    public readonly router: Router
  ) {}

  markAllRead() {
    this.notifications.markAllRead(this.auth.user()?.id ?? null);
  }

  onMenu(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'profile') this.router.navigate(['/profile']);
    if (value === 'worker') this.router.navigate(['/worker']);
    if (value === 'admin') this.router.navigate(['/admin']);
    if (value === 'logout') this.auth.logout();
  }
}
