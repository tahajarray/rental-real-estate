import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Estate } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { EstatesService, MAX_COMPARE } from '../../core/services/estates.service';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="card" (click)="openDetail()">
      <img [src]="estate.images[0]" [alt]="estate.title" />
      <div class="p-3">
        <div class="tags">
          <span>{{ estate.type }}</span>
          <span>{{ estate.listingPurpose === 'rent' ? 'For Rent' : 'For Sale' }}</span>
          <span *ngIf="estate.status !== 'active'">{{ estate.status }}</span>
        </div>
        <h3>{{ estate.title }}</h3>
        <p class="muted">{{ estate.governorate }} · {{ estate.zone }}</p>
        <p class="price">{{ formatPrice() }}</p>
        <div class="actions" (click)="$event.stopPropagation()">
          <button type="button" (click)="toggleSave()">{{ isSaved() ? 'Unsave' : 'Save' }}</button>
          <button type="button" (click)="toggleCompare()">{{ isComparing() ? 'Uncompare' : 'Compare' }}</button>
        </div>
        <p class="warn" *ngIf="showLimit">Max {{ maxCompare }} properties.</p>
      </div>
    </article>
  `,
  styles: [
    `
      .card { border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; background: #fff; cursor: pointer; }
      img { width: 100%; height: 180px; object-fit: cover; }
      h3 { margin: 8px 0 4px; font-size: 1rem; }
      .muted { color: #64748b; font-size: .8rem; margin: 0; }
      .price { color: #10b981; font-weight: 700; margin: 8px 0; }
      .actions { display: flex; gap: 8px; }
      button { border: 1px solid #cbd5e1; background: white; border-radius: 8px; padding: 6px 10px; font-size: .8rem; }
      .tags { display: flex; gap: 6px; flex-wrap: wrap; }
      .tags span { background: #eff6ff; color: #2563eb; border-radius: 999px; padding: 2px 8px; font-size: .7rem; }
      .warn { color: #ef4444; font-size: .75rem; margin: 6px 0 0; }
    `,
  ],
})
export class PropertyCardComponent {
  @Input({ required: true }) estate!: Estate;

  showLimit = false;
  readonly maxCompare = MAX_COMPARE;

  constructor(
    private readonly router: Router,
    private readonly estates: EstatesService,
    private readonly auth: AuthService
  ) {}

  openDetail() {
    this.router.navigate(['/estate', this.estate.id]);
  }

  isSaved() {
    return this.estates.savedIds().includes(this.estate.id);
  }

  isComparing() {
    return this.estates.compareIds().includes(this.estate.id);
  }

  toggleSave() {
    if (!this.auth.user()) {
      this.router.navigate(['/login']);
      return;
    }
    this.estates.toggleSave(this.estate.id);
  }

  toggleCompare() {
    const ok = this.estates.toggleCompare(this.estate.id);
    this.showLimit = !ok;
    if (!ok) setTimeout(() => (this.showLimit = false), 2000);
  }

  formatPrice() {
    const amount = this.estate.price.toLocaleString();
    return this.estate.listingPurpose === 'rent' ? `${amount} DT/mo` : `${amount} DT`;
  }
}
