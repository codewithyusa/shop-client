import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface Favorite {
  id: number;
  productId: number;
  productName: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class Favorites implements OnInit {
  private http = inject(HttpClient);

  favorites = signal<Favorite[]>([]);
  isLoading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.isLoading.set(true);
    this.http.get<Favorite[]>('/api/favorites').subscribe({
      next: (data) => {
        this.favorites.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load favorites.');
        this.isLoading.set(false);
      }
    });
  }

  removeFavorite(productId: number) {
    this.http.post(`/api/favorites/${productId}/toggle`, {}).subscribe({
      next: () => this.favorites.update(f => f.filter(x => x.productId !== productId))
    });
  }
}