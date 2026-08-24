import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  image: string;
  quantity: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isSubmitting = signal(false);
  errorMessage = signal('');
  cartItems = signal<CartItem[]>([]);
  selectedPayment = signal<'card' | 'cash'>('card');

  checkoutForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: [''],
    cardNumber: [''],
    expiry: [''],
    cvv: [''],
  });

  ngOnInit() {
    this.http.get<any>('/api/cart').subscribe({
      next: (data) => this.cartItems.set(Array.isArray(data?.items) ? data.items : [])
    });
  }

  getTotalItems(): number {
    return this.cartItems().reduce((s, i) => s + i.quantity, 0);
  }

  getSubtotal(): number {
    return this.cartItems().reduce((s, i) => s + i.price * i.quantity, 0);
  }

  selectPayment(method: 'card' | 'cash') {
    this.selectedPayment.set(method);
  }

  placeOrder() {
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.http.post<{ id: number }>('/api/orders', {}).subscribe({
      next: (order) => {
        this.http.post<{ checkoutUrl: string }>('/api/payments/initiate', { orderId: order.id }).subscribe({
          next: (res) => {
            this.isSubmitting.set(false);
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