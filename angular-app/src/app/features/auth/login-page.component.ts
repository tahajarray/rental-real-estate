import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth">
      <h1>Welcome Back</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input type="email" formControlName="email" placeholder="Email" />
        <input type="password" formControlName="password" placeholder="Password" />
        <p class="error" *ngIf="error">{{ error }}</p>
        <button type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Signing in...' : 'Sign In' }}</button>
      </form>
      <p>Don't have an account? <a routerLink="/signup">Sign up</a></p>
    </section>
  `,
  styles: [
    `
      .auth { max-width: 420px; margin: 40px auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
      form { display: grid; gap: 10px; }
      input, button { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
      button { background: #2563eb; color: #fff; border-color: #2563eb; }
      .error { color: #ef4444; margin: 0; font-size: .85rem; }
    `,
  ],
})
export class LoginPageComponent {
  error = '';
  loading = false;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private readonly router: Router) {}

  async submit() {
    if (this.form.invalid) return;
    this.error = '';
    this.loading = true;
    const user = await this.auth.login(this.form.value.email!, this.form.value.password!);
    this.loading = false;
    if (!user) {
      this.error = 'Invalid email or password.';
      return;
    }
    if (user.role === 'admin') this.router.navigate(['/admin']);
    else if (user.role === 'worker') this.router.navigate(['/worker']);
    else this.router.navigate(['/']);
  }
}
