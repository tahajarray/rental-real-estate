import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  template: `
    <section class="contact">
      <h1>Get in touch</h1>
      <p>Have questions or need help finding a home? Reach out to our team.</p>
      <div class="grid">
        <article><h3>Address</h3><p>Avenue Habib Bourguiba, 1000 Tunis, Tunisia</p></article>
        <article><h3>Phone</h3><p>+216 71 234 567</p></article>
        <article><h3>Email</h3><p>hello@nestfinder.tn</p></article>
        <article><h3>Working hours</h3><p>Monday–Friday: 9am – 6pm</p></article>
      </div>
    </section>
  `,
  styles: [
    `
      .contact { padding: 24px 16px; display: grid; gap: 12px; }
      .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      article { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
      h3 { margin: 0 0 8px; }
      p { margin: 0; color: #64748b; }
    `,
  ],
})
export class ContactPageComponent {}
