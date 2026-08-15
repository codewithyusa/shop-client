import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home').then(m => m.Home),
    canActivate: [authGuard]
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup/signup').then(m => m.SignupComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [authGuard]
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart').then(m => m.Cart),
    canActivate: [authGuard]
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/product-list').then(m => m.ProductList),
    canActivate: [authGuard]
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-detail').then(m => m.ProductDetail),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout').then(m => m.Checkout),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/orders/order-history').then(m => m.OrderHistory),
    canActivate: [authGuard]
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites').then(m => m.Favorites),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];