import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get email() { return this.forgotForm.controls.email; }

  onSubmit() {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { email } = this.forgotForm.getRawValue();

    this.http.post('/api/auth/forgot-password', { email }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('If an account exists, a reset code has been sent.');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Request failed.');
      },
    });
  }
}