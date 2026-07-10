import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EstatesService } from '../../core/services/estates.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { AuditService } from '../../core/services/audit.service';

@Component({
  selector: 'app-worker-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="wrap">
      <div class="head">
        <h1>Worker Dashboard</h1>
        <div class="actions">
          <button *ngIf="auth.user()?.role === 'admin'" (click)="router.navigate(['/admin'])">Team & access</button>
          <button (click)="router.navigate(['/worker/visits'])">Visit slots</button>
          <button class="primary" (click)="router.navigate(['/worker/add-estate'])">Add property</button>
        </div>
      </div>

      <div class="stats">
        <article>Total: {{ estates.estates().length }}</article>
        <article>Active: {{ activeCount() }}</article>
        <article>Views: {{ totalViews() }}</article>
        <article>Saves: {{ totalSaves() }}</article>
      </div>

      <section class="panel">
        <h2>Recent Bookings ({{ estates.bookings().length }})</h2>
        <div *ngFor="let b of estates.bookings()" class="row">
          <div>
            <strong>{{ b.userName }}</strong> booked <span>{{ b.estateTitle }}</span>
            <small>{{ b.date }} {{ b.startTime }} · {{ b.bookingStatus }}</small>
          </div>
          <div class="row-actions">
            <button *ngIf="b.bookingStatus !== 'approved'" (click)="approve(b.estateId, b.slotId, b.userId, b.estateTitle)">Approve</button>
            <button (click)="estates.deleteBooking(b.estateId, b.slotId)">Delete</button>
          </div>
        </div>
      </section>

      <section class="panel">
        <h2>All Listings ({{ estates.estates().length }})</h2>
        <div *ngFor="let e of estates.estates()" class="row">
          <div>
            <strong>{{ e.title }}</strong>
            <small>{{ e.governorate }} · {{ e.price | number }} DT {{ e.listingPurpose === 'rent' ? '/mo' : '' }} · {{ e.status }}</small>
          </div>
          <div class="row-actions">
            <button (click)="toggleStatus(e.id)">Toggle status</button>
            <button (click)="router.navigate(['/estate', e.id])">View</button>
            <button class="danger" (click)="remove(e.id)">Delete</button>
          </div>
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      .wrap { padding: 20px 16px; display: grid; gap: 12px; }
      .head { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
      .actions, .row-actions { display: flex; gap: 8px; flex-wrap: wrap; }
      button { border: 1px solid #cbd5e1; border-radius: 8px; padding: 7px 10px; background: #fff; }
      .primary { background: #2563eb; color: #fff; border-color: #2563eb; }
      .danger { color: #ef4444; }
      .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
      .stats article, .panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
      .row { display: flex; justify-content: space-between; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 8px; }
      small { display: block; color: #64748b; }
    `,
  ],
})
export class WorkerDashboardPageComponent {
  readonly activeCount = computed(() => this.estates.estates().filter((e) => e.status === 'active').length);
  readonly totalViews = computed(() => this.estates.estates().reduce((acc, e) => acc + e.views, 0));
  readonly totalSaves = computed(() => this.estates.estates().reduce((acc, e) => acc + e.savesCount, 0));

  constructor(
    public readonly estates: EstatesService,
    public readonly auth: AuthService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
    public readonly router: Router
  ) {}

  toggleStatus(estateId: string) {
    const estate = this.estates.getEstate(estateId);
    if (!estate) return;
    const next = estate.status === 'active' ? (estate.listingPurpose === 'rent' ? 'rented' : 'sold') : 'active';
    this.estates.updateEstate(estateId, { status: next });
    const actor = this.auth.user();
    if (actor) {
      this.audit.log({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'estate_status_changed',
        targetId: estate.id,
        targetName: estate.title,
        details: `${estate.status} → ${next}`,
      });
    }
  }

  remove(id: string) {
    const estate = this.estates.getEstate(id);
    this.estates.deleteEstate(id);
    const actor = this.auth.user();
    if (actor && estate) {
      this.audit.log({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'estate_deleted',
        targetId: estate.id,
        targetName: estate.title,
      });
    }
  }

  approve(estateId: string, slotId: string, userId: string, estateTitle: string) {
    this.estates.approveBooking(estateId, slotId);
    if (userId) {
      this.notifications.addNotification({
        userId,
        estateId,
        estateTitle,
        message: `Your visit to "${estateTitle}" has been approved.`,
      });
    }
  }
}
