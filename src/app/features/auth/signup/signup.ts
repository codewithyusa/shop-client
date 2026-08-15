import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  signupForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  get fullName() { return this.signupForm.controls.fullName; }
  get email() { return this.signupForm.controls.email; }
  get password() { return this.signupForm.controls.password; }
  get confirmPassword() { return this.signupForm.controls.confirmPassword; }

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { fullName, email, password } = this.signupForm.getRawValue();

    this.auth.signup({ name: fullName, email, password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Account created! Please log in.');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Signup failed.');
      },
    });
  }
}