import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmailComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  verifyForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  get code() { return this.verifyForm.controls.code; }

  onSubmit() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { code } = this.verifyForm.getRawValue();

    this.http.post('/api/auth/verify-email', { code }, { withCredentials: true }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Email verified! Redirecting to login...');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Invalid or expired code.');
      },
    });
  }

  resendCode() {
    this.http.post('/api/auth/send-verification', {}, { withCredentials: true }).subscribe({
      next: () => this.successMessage.set('New code sent to your email.'),
      error: () => this.errorMessage.set('Failed to resend code.'),
    });
  }
}