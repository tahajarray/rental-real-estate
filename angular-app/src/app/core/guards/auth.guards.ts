import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user() ? true : router.createUrlTree(['/login']);
};

export const workerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  if (!user) return router.createUrlTree(['/login']);
  return user.role === 'worker' || user.role === 'admin' ? true : router.createUrlTree(['/']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  if (!user) return router.createUrlTree(['/login']);
  if (user.role === 'worker') return router.createUrlTree(['/worker']);
  return user.role === 'admin' ? true : router.createUrlTree(['/']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user() ? router.createUrlTree(['/']) : true;
};
