import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="profile" *ngIf="auth.user() as user">
      <h1>My Profile</h1>
      <img [src]="user.avatar" [alt]="user.name" />
      <form [formGroup]="form" (ngSubmit)="save()">
        <input formControlName="name" placeholder="Name" />
        <input formControlName="email" placeholder="Email" />
        <input formControlName="phone" placeholder="Phone" />
        <button type="submit">Save</button>
      </form>
      <button class="danger" (click)="logout()">Logout</button>
    </section>
  `,
  styles: [
    `
      .profile { max-width: 520px; margin: 32px auto; display: grid; gap: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; }
      img { width: 76px; height: 76px; border-radius: 50%; object-fit: cover; }
      form { display: grid; gap: 10px; }
      input, button { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
      button { background: #2563eb; color: #fff; border-color: #2563eb; }
      .danger { background: #fff; color: #ef4444; border-color: #ef4444; }
    `,
  ],
})
export class ProfilePageComponent {
  readonly form = this.fb.group({
    name: [''],
    email: [''],
    phone: [''],
  });

  constructor(public readonly auth: AuthService, private readonly fb: FormBuilder, private readonly router: Router) {
    effect(() => {
      const user = this.auth.user();
      if (!user) return;
      this.form.patchValue({ name: user.name, email: user.email, phone: user.phone }, { emitEvent: false });
    });
  }

  async save() {
    await this.auth.updateProfile(this.form.value);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
