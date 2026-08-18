import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models/product.model';
import { DecimalPipe } from '@angular/common';

type Tab = 'create' | 'products' | 'analytics';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  activeTab = signal<Tab>('create');
  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  products = signal<Product[]>([]);
  isLoadingProducts = signal(false);
  selectedFileName = signal('');
  imagePreview = signal('');
  analytics = signal<any>(null);
  isLoadingAnalytics = signal(false);

  productForm = this.fb.nonNullable.group({
    productName: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', Validators.required],
    price: [0.01, [Validators.required, Validators.min(0.01)]],
    category: ['', Validators.required],
    color: ['', Validators.required],
    size: ['', Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
    isFeatured: [false],
    imageUrl: ['', Validators.required]
  });

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    if (tab === 'products') this.loadProducts();
    if (tab === 'analytics') this.loadAnalytics();
  }

  loadProducts() {
    this.isLoadingProducts.set(true);
    this.http.get<any>('/api/products').subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        this.products.set(list);
        this.isLoadingProducts.set(false);
      },
      error: () => {
        this.products.set([]);
        this.isLoadingProducts.set(false);
      }
    });
  }

  loadAnalytics() {
    this.isLoadingAnalytics.set(true);
    this.http.get<any>('/api/analytics/summary').subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.isLoadingAnalytics.set(false);
      },
      error: () => this.isLoadingAnalytics.set(false)
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return;
    this.http.delete(`/api/products/${id}`).subscribe({
      next: () => this.products.update(p => p.filter(x => x.id !== id))
    });
  }

  toggleFeatured(id: number) {
    this.http.patch(`/api/products/${id}/toggle-featured`, {}).subscribe({
      next: (updated: any) => {
        this.products.update(p =>
          p.map(x => x.id === id ? { ...x, isFeatured: updated.isFeatured } : x)
        );
      }
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.selectedFileName.set(file.name);
      const placeholderUrl = 'https://placehold.co/400x400?text=' +
        encodeURIComponent(file.name.split('.')[0]);
      this.productForm.controls.imageUrl.setValue(placeholderUrl);
      this.imagePreview.set(placeholderUrl);
    }
  }

  createProduct() {
    this.successMessage.set('');
    this.errorMessage.set('');
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const val = this.productForm.getRawValue();
    const payload = {
      name: val.productName,
      description: val.description,
      price: val.price,
      category: val.category,
      color: val.color,
      size: val.size,
      stock: val.stock,
      isFeatured: val.isFeatured,
      image: val.imageUrl
    };

    this.isSubmitting.set(true);
    this.http.post('/api/products', payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Product created successfully!');
        this.selectedFileName.set('');
        this.imagePreview.set('');
        this.productForm.reset({
          productName: '', description: '',
          price: 0.01, category: '',
          color: '', size: '',
          stock: 0, isFeatured: false, imageUrl: ''
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail ?? 'Failed to create product.');
      }
    });
  }
}