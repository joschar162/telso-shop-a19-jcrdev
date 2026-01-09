import { Component, inject, input, OnInit } from '@angular/core';
import { Product } from '@products/interfaces/product.interface';
import { ProductCarouselComponent } from '@products/components/product-carousel/product-carousel.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { ProductsService } from '@products/services/products.service';

@Component({
  selector: 'product-details',
  imports: [
    ProductCarouselComponent,
    ReactiveFormsModule,
    FormErrorLabelComponent,
  ],
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {
  product = input.required<Product>(); //se pasa desde el padre como [product]="..."
  productService = inject(ProductsService);
  fb = inject(FormBuilder);

  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: [
      '',
      [Validators.required, Validators.pattern(FormUtils.slugPattern)],
    ],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    sizes: [['']],
    images: [[]],
    tags: [''],
    gender: [
      'men',
      [Validators.required, Validators.pattern(/men|women|kid|unisex/)],
    ],
  });
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  ngOnInit(): void {
    this.setFormValue(this.product());
  }

  setFormValue(formLike: Partial<Product>) {
    // this.productForm.reset(this.product() as any);
    this.productForm.patchValue(this.product() as any);
    this.productForm.patchValue({ tags: formLike.tags?.join(',') }); // convertir array a string
  }

  onSizeClicked(size: string) {
    const currentSizes = this.productForm.value.sizes ?? [];
    if (currentSizes.includes(size)) {
      // quitar el size
      currentSizes.splice(currentSizes.indexOf(size), 1);
    } else {
      // agregar el size
      currentSizes.push(size);
    }

    this.productForm.patchValue({ sizes: currentSizes });
  }

  onSubmit() {
    const isValid = this.productForm.valid;
    this.productForm.markAllAsTouched();

    if (!isValid) return;
    const formValue = this.productForm.value;

    const productLike: Partial<Product> = {
      ...(formValue as any),
      // tags: formValue.tags?.split(',').map((tag) => tag.trim().toLowerCase()) || [],
      tags:
        formValue.tags
          ?.toLowerCase()
          .split(',')
          .map((tag) => tag.trim()) || [],
    };
    this.productService.updateProduct(productLike);
  }
}
