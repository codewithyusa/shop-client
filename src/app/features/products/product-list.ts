import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  isLoading = signal(true);
  error = signal('');
  category = signal('');
  searchQuery = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const cat = params['category'] ?? '';
      this.category.set(cat);
      this.loadProducts(cat);
    });
  }

  loadProducts(category: string) {
    this.isLoading.set(true);
    const url = category
      ? `/api/products/category/${encodeURIComponent(category)}`
      : '/api/products';

    this.http.get<any>(url).subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : (data.items ?? []);
        this.products.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products.');
        this.isLoading.set(false);
      }
    });
  }

  search() {
    if (!this.searchQuery.trim()) {
      this.loadProducts(this.category());
      return;
    }
    this.isLoading.set(true);
    this.http.get<any>(`/api/products/search?name=${encodeURIComponent(this.searchQuery)}`).subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : (data.items ?? []);
        this.products.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Search failed.');
        this.isLoading.set(false);
      }
    });
  }
}