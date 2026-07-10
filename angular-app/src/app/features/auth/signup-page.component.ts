import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

const PHONE_RE = /^\d{8}$/;

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth">
      <h1>Create Account</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input formControlName="name" placeholder="Full Name" />
        <input type="email" formControlName="email" placeholder="Email" />
        <div class="phone">
          <span>+216</span>
          <input formControlName="phone" placeholder="20000000" />
        </div>
        <input type="password" formControlName="password" placeholder="Password" />
        <input type="password" formControlName="confirm" placeholder="Confirm password" />
        <label><input type="checkbox" formControlName="terms" /> I accept terms</label>
        <p class="error" *ngIf="error">{{ error }}</p>
        <button type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Creating...' : 'Create account' }}</button>
      </form>
      <p>Already have an account? <a routerLink="/login">Login</a></p>
    </section>
  `,
  styles: [
    `
      .auth { max-width: 460px; margin: 40px auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
      form { display: grid; gap: 10px; }
      input, button { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
      button { background: #2563eb; color: #fff; border-color: #2563eb; }
      .phone { display: grid; grid-template-columns: auto 1fr; }
      .phone span { border: 1px solid #cbd5e1; border-right: 0; border-radius: 8px 0 0 8px; padding: 10px; background: #f1f5f9; }
      .phone input { border-radius: 0 8px 8px 0; }
      .error { color: #ef4444; margin: 0; font-size: .85rem; }
    `,
  ],
})
export class SignupPageComponent {
  error = '';
  loading = false;

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_RE)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
    terms: [false, Validators.requiredTrue],
  });

  constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private readonly router: Router) {}

  async submit() {
    if (this.form.invalid) return;
    if (this.form.value.password !== this.form.value.confirm) {
      this.error = "Passwords don't match";
      return;
    }
    this.error = '';
    this.loading = true;
    const result = await this.auth.signup(
      this.form.value.name!,
      this.form.value.email!,
      `+216 ${this.form.value.phone!.slice(0, 2)} ${this.form.value.phone!.slice(2, 5)} ${this.form.value.phone!.slice(5, 8)}`,
      this.form.value.password!
    );
    this.loading = false;
    if (!result.success) {
      this.error = result.message || 'Could not create account';
      return;
    }
    this.router.navigate(['/']);
  }
}
