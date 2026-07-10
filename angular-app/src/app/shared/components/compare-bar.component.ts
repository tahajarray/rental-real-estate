import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { Router } from '@angular/router';
import { EstatesService, MAX_COMPARE } from '../../core/services/estates.service';

@Component({
  selector: 'app-compare-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bar" *ngIf="selected().length > 0">
      <span>Compare {{ selected().length }}/{{ maxCompare }}</span>
      <div class="chips">
        <button *ngFor="let estate of selected()" type="button" (click)="remove(estate.id)">{{ estate.title }} ✕</button>
      </div>
      <button type="button" [disabled]="selected().length < 2" (click)="router.navigate(['/compare'])">Compare now</button>
    </div>
  `,
  styles: [
    `
      .bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; border-top: 1px solid #e2e8f0; background: #fff; display: flex; gap: 8px; align-items: center; padding: 10px 16px; }
      .chips { display: flex; gap: 6px; overflow: auto; flex: 1; }
      .chips button { border: 1px solid #cbd5e1; border-radius: 999px; background: #f8fafc; padding: 4px 10px; white-space: nowrap; }
      button { border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; background: #fff; }
      button:disabled { opacity: .5; }
    `,
  ],
})
export class CompareBarComponent {
  readonly maxCompare = MAX_COMPARE;
  readonly selected = computed(() =>
    this.estates
      .compareIds()
      .map((id) => this.estates.estates().find((e) => e.id === id))
      .filter((v): v is NonNullable<typeof v> => !!v)
  );

  constructor(public readonly router: Router, private readonly estates: EstatesService) {}

  remove(id: string) {
    this.estates.toggleCompare(id);
  }
}
