import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isSubmitting = signal(false);
  errorMessage = signal('');

  checkoutForm = this.fb.nonNullable.group({
    couponCode: ['']
  });

  placeOrder() {
    this.errorMessage.set('');
    this.isSubmitting.set(true);
    const { couponCode } = this.checkoutForm.getRawValue();

    // Step 1: Create order
    this.http.post<{ id: number }>('/api/orders', { couponCode: couponCode || null }).subscribe({
      next: (order) => {
        // Step 2: Initiate payment
        this.http.post<{ checkoutUrl: string }>('/api/payments/initiate', { orderId: order.id }).subscribe({
          next: (res) => {
            this.isSubmitting.set(false);
            // Step 3: Redirect to fake checkout URL
            window.location.href = res.checkoutUrl;
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(err.error?.detail ?? 'Payment initiation failed.');
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Checkout failed.');
      }
    });
  }
}