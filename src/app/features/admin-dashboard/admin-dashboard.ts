import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models/product.model';
import { DecimalPipe } from '@angular/common';

type Tab = 'create' | 'products' | 'analytics' | 'users';

interface UserItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

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
  isUploadingImage = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  products = signal<Product[]>([]);
  isLoadingProducts = signal(false);
  selectedFileName = signal('');
  imagePreview = signal('');
  analytics = signal<any>(null);
  isLoadingAnalytics = signal(false);
  users = signal<UserItem[]>([]);
  isLoadingUsers = signal(false);
  editingProduct = signal<Product | null>(null);

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
    if (tab === 'users') this.loadUsers();
    if (tab === 'create') this.cancelEdit();
  }

  editProduct(product: Product) {
    this.editingProduct.set(product);
    this.activeTab.set('create');
    this.successMessage.set('');
    this.errorMessage.set('');
    this.imagePreview.set(product.image);
    this.selectedFileName.set('');
    this.productForm.patchValue({
      productName: product.name,
      description: product.description ?? '',
      price: product.price,
      category: product.category,
      color: product.color,
      size: product.size,
      stock: product.stock,
      isFeatured: product.isFeatured,
      imageUrl: product.image
    });
  }

  cancelEdit() {
    this.editingProduct.set(null);
    this.selectedFileName.set('');
    this.imagePreview.set('');
    this.successMessage.set('');
    this.errorMessage.set('');
    this.productForm.reset({
      productName: '', description: '', price: 0.01,
      category: '', color: '', size: '',
      stock: 0, isFeatured: false, imageUrl: ''
    });
  }

  loadUsers() {
    this.isLoadingUsers.set(true);
    this.http.get<any>('/api/admin/users').subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        this.users.set(list);
        this.isLoadingUsers.set(false);
      },
      error: () => { this.users.set([]); this.isLoadingUsers.set(false); }
    });
  }

  deleteUser(id: number) {
    if (!confirm('Delete this user?')) return;
    this.http.delete(`/api/admin/users/${id}`).subscribe({
      next: () => this.users.update(u => u.filter(x => x.id !== id))
    });
  }

  updateUserRole(id: number, role: string) {
    this.http.put(`/api/admin/users/${id}/role`, { role }).subscribe({
      next: (updated: any) => {
        this.users.update(u => u.map(x => x.id === id ? { ...x, role: updated.role } : x));
      }
    });
  }

  loadProducts() {
    this.isLoadingProducts.set(true);
    this.http.get<any>('/api/products').subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        this.products.set(list);
        this.isLoadingProducts.set(false);
      },
      error: () => { this.products.set([]); this.isLoadingProducts.set(false); }
    });
  }

  loadAnalytics() {
    this.isLoadingAnalytics.set(true);
    this.http.get<any>('/api/analytics/summary').subscribe({
      next: (data) => { this.analytics.set(data); this.isLoadingAnalytics.set(false); },
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
        this.products.update(p => p.map(x => x.id === id ? { ...x, isFeatured: updated.isFeatured } : x));
      }
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.selectedFileName.set(file.name);

    // Local preview
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Cloudinary via backend
    const formData = new FormData();
    formData.append('file', file);
    this.isUploadingImage.set(true);
    this.errorMessage.set('');

    this.http.post<{ url: string }>('/api/products/upload-image', formData).subscribe({
      next: (res) => {
        this.productForm.controls.imageUrl.setValue(res.url);
        this.isUploadingImage.set(false);
      },
      error: () => {
        this.errorMessage.set('Image upload failed.');
        this.isUploadingImage.set(false);
      }
    });
  }

  createProduct() {
    this.successMessage.set('');
    this.errorMessage.set('');
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.errorMessage.set('One or more fields are invalid.');
      return;
    }
    const val = this.productForm.getRawValue();
    const payload = {
      name: val.productName, description: val.description,
      price: val.price, category: val.category,
      color: val.color, size: val.size,
      stock: val.stock, isFeatured: val.isFeatured,
      image: val.imageUrl
    };
    this.isSubmitting.set(true);
    const editing = this.editingProduct();

    if (editing) {
      this.http.put(`/api/products/${editing.id}`, payload).subscribe({
        next: (updated: any) => {
          this.isSubmitting.set(false);
          this.successMessage.set('Product updated successfully!');
          this.products.update(p => p.map(x => x.id === editing.id ? { ...x, ...updated } : x));
          this.cancelEdit();
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.detail ?? 'Failed to update product.');
        }
      });
    } else {
      this.http.post('/api/products', payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.successMessage.set('Product created successfully!');
          this.cancelEdit();
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.detail ?? 'Failed to create product.');
        }
      });
    }
  }
}