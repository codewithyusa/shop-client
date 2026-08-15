import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private http = inject(HttpClient);

  products = signal<Product[]>([]);
  isLoading = signal(true);
  error = signal('');

  ngOnInit() {
    this.http.get<Product[]>('/api/products/featured').subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products.');
        this.isLoading.set(false);
      }
    });
  }
}