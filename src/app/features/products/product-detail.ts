import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  product = signal<Product | null>(null);
  isLoading = signal(true);
  error = signal('');
  quantity = signal(1);
  addingToCart = signal(false);
  cartMessage = signal('');
  isFavorited = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<Product>(`/api/products/${id}`).subscribe({
      next: (data) => {
        this.product.set(data);
        this.isLoading.set(false);
        if (this.auth.isLoggedIn()) this.loadFavoriteStatus(data.id);
      },
      error: () => {
        this.error.set('Product not found.');
        this.isLoading.set(false);
      }
    });
  }

  private requireAuth(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    return false;
  }

  private loadFavoriteStatus(productId: number) {
    this.http.get<any[]>('/api/favorites').subscribe({
      next: (data) => {
        const ids = new Set(data.map((f: any) => f.productId ?? f.id));
        this.isFavorited.set(ids.has(productId));
      }
    });
  }

  increment() {
    if (!this.requireAuth()) return;
    if (this.quantity() < (this.product()?.stock ?? 1))
      this.quantity.update(q => q + 1);
  }

  decrement() {
    if (!this.requireAuth()) return;
    if (this.quantity() > 1) this.quantity.update(q => q - 1);
  }

  addToCart() {
    if (!this.requireAuth()) return;
    const product = this.product();
    if (!product) return;
    this.addingToCart.set(true);
    this.http.post('/api/cart', { productId: product.id, quantity: this.quantity() }).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.cartMessage.set('Added to cart!');
        setTimeout(() => this.cartMessage.set(''), 2000);
      },
      error: () => {
        this.addingToCart.set(false);
        this.cartMessage.set('Failed to add to cart.');
      }
    });
  }

  toggleFavorite() {
    if (!this.requireAuth()) return;
    const product = this.product();
    if (!product) return;
    this.http.post<{ isFavorited: boolean }>(`/api/favorites/${product.id}/toggle`, {}).subscribe({
      next: (res) => this.isFavorited.set(res.isFavorited)
    });
  }
}