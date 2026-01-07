import { Component, input } from '@angular/core';
import { Product } from '@products/interfaces/product.interface';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'product-table',
  imports: [ProductImagePipe, CurrencyPipe, RouterLink],
  templateUrl: './product-table.component.html',
})
export class ProductTableComponent {
  products = input.required<Product[]>();
}
