import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from './core/auth';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { FooterComponent } from './shared/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  cartCount = signal(0);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  isAuthPage = computed(() => {
    const url = this.currentUrl();
    return url.includes('/login') ||
           url.includes('/signup') ||
           url.includes('/forgot-password') ||
           url.includes('/verify-email');
  });

  isAdmin = computed(() => this.auth.isAdmin());

  ngOnInit() {
    this.auth.isLoggedIn() && this.loadCartCount();
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.auth.isLoggedIn() && this.loadCartCount();
    });
  }

  loadCartCount() {
    this.http.get<any>('/api/cart').subscribe({
      next: (data) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        this.cartCount.set(items.reduce((sum: number, i: any) => sum + i.quantity, 0));
      },
      error: () => this.cartCount.set(0)
    });
  }

  logout() {
    this.auth.logout();
    this.cartCount.set(0);
  }
}