import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
  private fb = inject(FormBuilder);

  productForm = this.fb.nonNullable.group({
    productName: [
      '',
      [
        Validators.required,
        Validators.minLength(2)
      ]
    ],

    description: [
      '',
      Validators.required
    ],

    price: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    category: [
      '',
      Validators.required
    ],

    stock: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    image: [
      null as File | null,
      Validators.required
    ]
  });

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.productForm.controls.image.setValue(file);
      this.productForm.controls.image.markAsTouched();
    }
  }

  createProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product = this.productForm.getRawValue();

    console.log('Product created:', product);

    alert('Product created successfully!');

    this.productForm.reset({
      productName: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      image: null
    });
  }
}
