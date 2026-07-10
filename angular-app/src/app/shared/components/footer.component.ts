import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      <div>
        <strong>NestFinder</strong>
        <p>Tunisia's rental real-estate platform.</p>
      </div>
      <small>© 2026 NestFinder</small>
    </footer>
  `,
  styles: [
    `
      footer { margin-top: 32px; border-top: 1px solid #e2e8f0; background: #1f2937; color: #fff; padding: 20px 16px; display: flex; justify-content: space-between; gap: 8px; align-items: center; }
      p { margin: 4px 0 0; color: #cbd5e1; }
      small { color: #94a3b8; }
    `,
  ],
})
export class FooterComponent {}
