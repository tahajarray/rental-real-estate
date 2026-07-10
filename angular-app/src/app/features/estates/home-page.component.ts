import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { Router } from '@angular/router';
import { EstatesService } from '../../core/services/estates.service';
import { PropertyCardComponent } from '../../shared/components/property-card.component';
import { SearchBarComponent } from '../../shared/components/search-bar.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent, SearchBarComponent],
  template: `
    <section class="hero">
      <h1>Find your perfect home in Tunisia</h1>
      <app-search-bar />
    </section>

    <section class="wrap">
      <div class="title"><h2>Featured</h2><button (click)="router.navigate(['/explore'])">View all</button></div>
      <div class="grid"><app-property-card *ngFor="let e of featured()" [estate]="e" /></div>
    </section>

    <section class="wrap">
      <div class="title"><h2>Newest</h2></div>
      <div class="grid"><app-property-card *ngFor="let e of newest()" [estate]="e" /></div>
    </section>

    <section class="wrap">
      <div class="title"><h2>Recommended</h2></div>
      <div class="grid"><app-property-card *ngFor="let e of recommended()" [estate]="e" /></div>
    </section>
  `,
  styles: [
    `
      .hero { padding: 30px 16px; background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; display: grid; gap: 12px; }
      .hero h1 { margin: 0; font-size: 2rem; }
      .wrap { padding: 20px 16px; }
      .title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; }
      button { border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; background: #fff; }
    `,
  ],
})
export class HomePageComponent {
  readonly active = computed(() => this.estates.estates().filter((e) => e.status === 'active'));
  readonly featured = computed(() => [...this.active()].sort((a, b) => b.savesCount - a.savesCount).slice(0, 4));
  readonly newest = computed(() => [...this.active()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4));
  readonly recommended = computed(() => [...this.active()].sort((a, b) => b.views - a.views).slice(0, 4));

  constructor(private readonly estates: EstatesService, public readonly router: Router) {}
}
