import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth'; // ← fixed

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  get email() { return this.loginForm.controls.email; }
  get password() { return this.loginForm.controls.password; }

  onSubmit(): void {
    this.errorMessage.set('');
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const { email, password } = this.loginForm.getRawValue();

    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.auth.logout();
          this.errorMessage.set('Access denied. Admins only.');
        }
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Login failed.');
      },
    });
  }
}