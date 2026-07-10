import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Estate } from '../../core/models';
import { EstatesService } from '../../core/services/estates.service';
import { PropertyCardComponent } from '../../shared/components/property-card.component';
import { SearchBarComponent } from '../../shared/components/search-bar.component';

@Component({
  selector: 'app-explore-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyCardComponent, SearchBarComponent],
  template: `
    <section class="wrap">
      <h1>Explore Properties</h1>
      <app-search-bar compact (searched)="fromSearch($event)" />

      <div class="filters">
        <select [(ngModel)]="governorate">
          <option>All</option>
          <option *ngFor="let g of governorates" [value]="g">{{ g }}</option>
        </select>
        <select [(ngModel)]="purpose">
          <option value="all">All</option>
          <option value="rent">For Rent</option>
          <option value="sale">For Sale</option>
        </select>
        <select [(ngModel)]="sortBy">
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="surface">Surface</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      <p class="muted">{{ filtered().length }} properties found</p>
      <div class="grid"><app-property-card *ngFor="let e of filtered()" [estate]="e" /></div>
    </section>
  `,
  styles: [
    `
      .wrap { padding: 20px 16px; display: grid; gap: 12px; }
      .filters { display: flex; gap: 8px; flex-wrap: wrap; }
      select { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; }
      .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
      .muted { color: #64748b; margin: 0; }
    `,
  ],
})
export class ExplorePageComponent {
  governorates = [
    'Tunis','Ariana','Ben Arous','Manouba','Nabeul','Zaghouan','Bizerte','Béja','Jendouba','Kef','Siliana','Sousse',
    'Monastir','Mahdia','Sfax','Kairouan','Kasserine','Sidi Bouzid','Gabès','Medenine','Tataouine','Gafsa','Tozeur','Kebili'
  ];

  governorate = 'All';
  purpose: 'all' | 'rent' | 'sale' = 'all';
  type = 'All';
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'surface' | 'popular' = 'newest';
  query = signal('');

  readonly filtered = computed(() => {
    let list = [...this.estates.estates()];
    if (this.governorate !== 'All') {
      const q = this.governorate.toLowerCase();
      list = list.filter((e) => e.governorate.toLowerCase().includes(q) || e.zone.toLowerCase().includes(q) || e.address.toLowerCase().includes(q));
    }
    if (this.purpose !== 'all') list = list.filter((e) => e.listingPurpose === this.purpose);
    if (this.type !== 'All') list = list.filter((e) => e.type.toLowerCase() === this.type.toLowerCase());
    if (this.query()) {
      const q = this.query().toLowerCase();
      list = list.filter((e) => `${e.governorate} ${e.zone} ${e.address}`.toLowerCase().includes(q));
    }

    return this.sort(list);
  });

  constructor(private readonly estates: EstatesService, route: ActivatedRoute) {
    route.queryParams.subscribe((params) => {
      this.governorate = params['city'] || 'All';
      this.type = params['type'] && params['type'] !== 'All Types' ? params['type'] : 'All';
      this.purpose = params['purpose'] || 'all';
      this.query.set(params['city'] || '');
    });
  }

  fromSearch(params: { city: string; type: string; purpose: string }) {
    this.query.set(params.city || '');
    this.type = params.type === 'All Types' ? 'All' : params.type;
    this.purpose = (params.purpose as 'all' | 'rent' | 'sale') || 'all';
    this.governorate = params.city || 'All';
  }

  private sort(list: Estate[]) {
    switch (this.sortBy) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'surface':
        return list.sort((a, b) => b.surface - a.surface);
      case 'popular':
        return list.sort((a, b) => b.savesCount - a.savesCount);
      default:
        return list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
  }
}
