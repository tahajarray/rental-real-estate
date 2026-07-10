import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search" [class.compact]="compact">
      <select *ngIf="!compact" [(ngModel)]="purpose">
        <option value="all">All</option>
        <option value="rent">Rent</option>
        <option value="sale">Buy</option>
      </select>
      <input [(ngModel)]="city" placeholder="City or zone" />
      <select [(ngModel)]="type">
        <option>All Types</option>
        <option>Apartment</option>
        <option>House</option>
        <option>Studio</option>
        <option>Villa</option>
      </select>
      <button type="button" (click)="search()">Search</button>
    </div>
  `,
  styles: [
    `
      .search { display: flex; gap: 8px; flex-wrap: wrap; background: white; border-radius: 14px; padding: 10px; border: 1px solid #e2e8f0; }
      .compact { padding: 8px; }
      input, select { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; min-width: 130px; }
      button { border: none; background: #2563eb; color: white; border-radius: 10px; padding: 8px 14px; }
    `,
  ],
})
export class SearchBarComponent {
  @Input() compact = false;
  @Output() searched = new EventEmitter<{ city: string; type: string; purpose: string }>();

  city = '';
  type = 'All Types';
  purpose: 'all' | 'rent' | 'sale' = 'all';

  constructor(private readonly router: Router) {}

  search() {
    const payload = { city: this.city, type: this.type, purpose: this.purpose };
    if (this.searched.observed) {
      this.searched.emit(payload);
      return;
    }
    this.router.navigate(['/explore'], {
      queryParams: payload,
    });
  }
}
