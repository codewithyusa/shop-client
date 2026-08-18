import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

interface OrderItem {
  productId: number;
  productName: string;
  image: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss',
})
export class OrderHistory implements OnInit {
  private http = inject(HttpClient);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  error = signal('');

  ngOnInit() {
    this.http.get<Order[]>('/api/orders').subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load orders.');
        this.isLoading.set(false);
      }
    });
  }

  cancelOrder(id: number) {
    if (!confirm('Cancel this order?')) return;
    this.http.put(`/api/orders/${id}/cancel`, {}).subscribe({
      next: () => {
        this.orders.update(orders =>
          orders.map(o => o.id === id ? { ...o, orderStatus: 'Cancelled' } : o)
        );
      }
    });
  }
}