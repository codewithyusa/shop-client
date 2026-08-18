import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  user = this.auth.currentUser;
  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  profileForm = this.fb.nonNullable.group({
    name: [this.user()?.name ?? '', Validators.required],
    phone: [this.user()?.phone ?? ''],
  });

  updateProfile() {
    this.successMessage.set('');
    this.errorMessage.set('');
    if (this.profileForm.invalid) return;

    this.isSubmitting.set(true);
    const val = this.profileForm.getRawValue();

    this.http.put('/api/auth/profile', val).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Profile updated successfully!');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Update failed.');
      }
    });
  }
}