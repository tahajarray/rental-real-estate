import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { Router } from '@angular/router';
import { EstatesService } from '../../core/services/estates.service';
import { PropertyCardComponent } from '../../shared/components/property-card.component';

@Component({
  selector: 'app-saved-page',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent],
  template: `
    <section class="wrap">
      <h1>Saved Properties</h1>
      <p class="muted">{{ saved().length }} saved</p>
      <div *ngIf="saved().length === 0" class="empty">
        <p>No saved properties yet.</p>
        <button (click)="router.navigate(['/explore'])">Explore</button>
      </div>
      <div class="grid"><app-property-card *ngFor="let e of saved()" [estate]="e" /></div>
    </section>
  `,
  styles: [
    `
      .wrap { padding: 20px 16px; }
      .muted { color: #64748b; }
      .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
      .empty { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
      button { border: 1px solid #2563eb; background: #2563eb; color: #fff; border-radius: 8px; padding: 8px 12px; }
    `,
  ],
})
export class SavedPageComponent {
  readonly saved = computed(() =>
    this.estates.estates().filter((e) => this.estates.savedIds().includes(e.id))
  );

  constructor(private readonly estates: EstatesService, public readonly router: Router) {}
}
