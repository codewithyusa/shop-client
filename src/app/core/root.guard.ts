import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const rootGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    if (auth.isAdmin()) {
      return router.createUrlTree(['/admin']);
    } else {
      return router.createUrlTree(['/home']);
    }
  }

  return router.createUrlTree(['/home']);
};