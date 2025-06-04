import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Product } from 'src/app/core/models/product.model'
import { ProductService } from 'src/app/core/services/product.service'

@Component({
  selector: 'app-add-product-page',
  templateUrl: './add-product-page.component.html',
})
export class AddProductPageComponent {
  errorMessage = '';

  constructor(private productService: ProductService, private router: Router) {}

  /**
   * Maneja el evento de guardado de un producto.
   *
   * Este método recibe los datos de un producto (sin el campo 'id', pero con un 'id' proporcionado),
   * intenta crear el producto a través del servicio correspondiente y navega a la lista de productos
   * si la operación es exitosa. Si ocurre un error durante la creación, almacena el mensaje de error.
   *
   * @param productData - Datos del producto a guardar, excluyendo el campo 'id' de la interfaz Product,
   * pero incluyendo un 'id' como string.
   */
  onSave(productData: Omit<Product, 'id'> & { id: string }): void {
    this.errorMessage = '';

    this.productService.createProduct(productData).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }

  /**
   * Maneja el evento de cancelación en el formulario de agregar producto.
   * Redirige al usuario a la página de listado de productos.
   */
  onCancel(): void {
    this.router.navigate(['/products']);
  }
}
