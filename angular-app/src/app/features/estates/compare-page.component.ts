import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { Router } from '@angular/router';
import { EstatesService } from '../../core/services/estates.service';

@Component({
  selector: 'app-compare-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="wrap">
      <h1>Compare Properties</h1>
      <div *ngIf="selected().length < 2" class="empty">
        Select at least 2 properties.
        <button (click)="router.navigate(['/explore'])">Browse properties</button>
      </div>

      <table *ngIf="selected().length >= 2">
        <thead>
          <tr>
            <th>Spec</th>
            <th *ngFor="let e of selected()">{{ e.title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Price</td><td *ngFor="let e of selected()">{{ e.price | number }} DT</td></tr>
          <tr><td>Type</td><td *ngFor="let e of selected()">{{ e.type }}</td></tr>
          <tr><td>Purpose</td><td *ngFor="let e of selected()">{{ e.listingPurpose }}</td></tr>
          <tr><td>Governorate</td><td *ngFor="let e of selected()">{{ e.governorate }}</td></tr>
          <tr><td>Rooms</td><td *ngFor="let e of selected()">{{ e.rooms }}</td></tr>
          <tr><td>Bathrooms</td><td *ngFor="let e of selected()">{{ e.bathrooms }}</td></tr>
          <tr><td>Surface</td><td *ngFor="let e of selected()">{{ e.surface }} m²</td></tr>
          <tr><td>Furnished</td><td *ngFor="let e of selected()">{{ e.furnished ? 'Yes' : 'No' }}</td></tr>
          <tr><td>Parking</td><td *ngFor="let e of selected()">{{ e.parking ? 'Yes' : 'No' }}</td></tr>
          <tr><td>Internet</td><td *ngFor="let e of selected()">{{ e.internet ? 'Yes' : 'No' }}</td></tr>
        </tbody>
      </table>
    </section>
  `,
  styles: [
    `
      .wrap { padding: 20px 16px; }
      table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
      th, td { border-bottom: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: .85rem; }
      .empty { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; display: grid; gap: 10px; }
      button { border: 1px solid #2563eb; background: #2563eb; color: #fff; border-radius: 8px; padding: 8px 12px; width: fit-content; }
    `,
  ],
})
export class ComparePageComponent {
  readonly selected = computed(() =>
    this.estates
      .compareIds()
      .map((id) => this.estates.estates().find((e) => e.id === id))
      .filter((v): v is NonNullable<typeof v> => !!v)
  );

  constructor(private readonly estates: EstatesService, public readonly router: Router) {}
}
