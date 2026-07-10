import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EstatesService } from '../../core/services/estates.service';
import { PropertyCardComponent } from '../../shared/components/property-card.component';

@Component({
  selector: 'app-estate-detail-page',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent],
  template: `
    <section class="wrap" *ngIf="estate() as e; else notFound">
      <button class="back" (click)="router.navigate(['/explore'])">← Back to explore</button>
      <div class="layout">
        <div class="main">
          <img [src]="e.images[imgIndex()]" [alt]="e.title" class="hero" />
          <div class="thumbs">
            <button *ngFor="let img of e.images; let i = index" (click)="imgIndex.set(i)" [class.active]="i === imgIndex()">
              <img [src]="img" alt="" />
            </button>
          </div>
          <h1>{{ e.title }}</h1>
          <p class="muted">{{ e.address }}, {{ e.zone }}, {{ e.governorate }}</p>
          <p class="price">{{ e.price | number }} DT {{ e.listingPurpose === 'rent' ? '/ month' : '' }}</p>
          <p>{{ e.description }}</p>
          <div class="specs">
            <span>{{ e.rooms }} rooms</span><span>{{ e.bathrooms }} baths</span><span>{{ e.surface }} m²</span>
            <span>{{ e.furnished ? 'Furnished' : 'Unfurnished' }}</span><span>{{ e.parking ? 'Parking' : 'No parking' }}</span>
            <span>{{ e.internet ? 'Internet' : 'No internet' }}</span>
          </div>
          <div class="actions">
            <button (click)="toggleSave(e.id)">{{ isSaved(e.id) ? 'Saved' : 'Save' }}</button>
          </div>
          <h2>Visit slots</h2>
          <div class="slots">
            <button *ngFor="let s of e.visitSlots" [disabled]="s.isBooked" (click)="book(e.id, s.id)">
              {{ s.date }} · {{ s.startTime }}
              <span *ngIf="s.isBooked">(booked)</span>
            </button>
          </div>
          <p class="ok" *ngIf="booked">Visit request sent!</p>
          <p class="error" *ngIf="conflict">{{ conflict }}</p>
        </div>
        <aside>
          <h3>Listed by</h3>
          <p>{{ e.ownerName }}</p>
          <img [src]="e.ownerAvatar" [alt]="e.ownerName" class="owner" />
        </aside>
      </div>

      <h2>Similar properties</h2>
      <div class="grid"><app-property-card *ngFor="let s of similar()" [estate]="s" /></div>
    </section>

    <ng-template #notFound>
      <section class="wrap"><h1>Property not found</h1></section>
    </ng-template>
  `,
  styles: [
    `
      .wrap { padding: 20px 16px; }
      .layout { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
      .main, aside { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; }
      .hero { width: 100%; height: 330px; object-fit: cover; border-radius: 12px; }
      .thumbs { display: flex; gap: 8px; margin-top: 8px; }
      .thumbs button { border: 1px solid #cbd5e1; border-radius: 8px; padding: 0; overflow: hidden; }
      .thumbs button.active { border-color: #2563eb; }
      .thumbs img { width: 60px; height: 48px; object-fit: cover; display: block; }
      .price { color: #10b981; font-weight: 700; font-size: 1.4rem; }
      .muted { color: #64748b; }
      .specs { display: flex; gap: 8px; flex-wrap: wrap; }
      .specs span { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 999px; padding: 4px 10px; font-size: .8rem; }
      .slots { display: flex; gap: 8px; flex-wrap: wrap; }
      .slots button, .actions button, .back { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; background: #fff; }
      .owner { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; }
      .grid { margin-top: 10px; display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
      .ok { color: #10b981; }
      .error { color: #ef4444; }
      @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
    `,
  ],
})
export class EstateDetailPageComponent {
  readonly estateId = signal('');
  readonly imgIndex = signal(0);
  booked = false;
  conflict = '';

  readonly estate = computed(() => this.estates.getEstate(this.estateId()));
  readonly similar = computed(() => {
    const e = this.estate();
    if (!e) return [];
    return this.estates
      .estates()
      .filter((x) => x.id !== e.id && (x.governorate === e.governorate || x.type === e.type))
      .slice(0, 3);
  });

  constructor(
    route: ActivatedRoute,
    private readonly estates: EstatesService,
    private readonly auth: AuthService,
    public readonly router: Router
  ) {
    route.params.subscribe((p) => this.estateId.set(p['id']));
  }

  isSaved(id: string) {
    return this.estates.savedIds().includes(id);
  }

  toggleSave(id: string) {
    if (!this.auth.user()) {
      this.router.navigate(['/login']);
      return;
    }
    this.estates.toggleSave(id);
  }

  book(estateId: string, slotId: string) {
    const user = this.auth.user();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    const ok = this.estates.bookVisitSlot(estateId, slotId, user.id, user.name);
    this.booked = ok;
    this.conflict = ok ? '' : 'That slot was booked by someone else. Please choose another.';
  }
}
