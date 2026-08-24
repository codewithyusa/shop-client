import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartResponse {
  items: CartItem[];
  total: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
  private http = inject(HttpClient);

  cart = signal<CartResponse | null>(null);
  isLoading = signal(true);
  error = signal('');
  voucherCode = '';
  voucherMessage = signal('');

  ngOnInit() { this.loadCart(); }

  loadCart() {
    this.isLoading.set(true);
    this.http.get<CartResponse>('/api/cart').subscribe({
      next: (data) => { this.cart.set(data); this.isLoading.set(false); },
      error: () => { this.error.set('Failed to load cart.'); this.isLoading.set(false); }
    });
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity < 1) return;
    this.http.put(`/api/cart/${productId}`, { quantity }).subscribe({ next: () => this.loadCart() });
  }

  removeItem(productId: number) {
    this.http.delete(`/api/cart/${productId}`).subscribe({ next: () => this.loadCart() });
  }

  clearCart() {
    this.http.delete('/api/cart').subscribe({ next: () => this.loadCart() });
  }

  applyVoucher() {
    this.voucherMessage.set('Voucher applied!');
  }

  getTotalItems(): number {
    return this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  }

  getSubtotal(): number {
    return this.cart()?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  }
}