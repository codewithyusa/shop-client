import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from './core/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private router = inject(Router);
  private auth = inject(AuthService);

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

  logout() {
    this.auth.logout();
  }
}