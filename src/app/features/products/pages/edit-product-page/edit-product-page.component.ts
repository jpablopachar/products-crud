import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { Product } from 'src/app/core/models/product.model'
import { ProductService } from 'src/app/core/services/product.service'

@Component({
  selector: 'app-edit-product-page',
  templateUrl: './edit-product-page.component.html',
  styleUrls: ['./edit-product-page.component.scss'],
})
export class EditProductPageComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  productId: string;
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {
    this.productId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.loadProduct();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Maneja el evento de guardado de un producto editado.
   *
   * Envía los datos del producto al servicio para actualizar el producto existente.
   * Si la actualización es exitosa, navega a la lista de productos.
   * Si ocurre un error durante la actualización, muestra el mensaje de error correspondiente.
   *
   * @param productData - Los datos del producto a actualizar, excluyendo el campo 'id'.
   */
  onSave(productData: Omit<Product, 'id'>): void {
    this.errorMessage = '';

    this.productService
      .updateProduct(this.productId, productData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.errorMessage = error.message;
        },
      });
  }

  /**
   * Navega de regreso a la lista de productos cuando el usuario cancela la edición.
   *
   * Este método se invoca al hacer clic en el botón de cancelar en la página de edición de productos.
   * Utiliza el enrutador para redirigir al usuario a la ruta '/products'.
   */
  onCancel(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Carga la información de un producto específico utilizando su ID.
   *
   * Este método realiza una solicitud al servicio de productos para obtener los datos del producto.
   * Si el producto existe, lo asigna a la propiedad `product`. Si no se encuentra, muestra un mensaje de error
   * y redirige al usuario a la lista de productos. También gestiona el estado de carga y los posibles errores
   * durante la obtención de los datos.
   *
   * @private
   * @returns {void}
   */
  private loadProduct(): void {
    this.productService
      .getProductById(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          if (product) {
            this.product = product;
          } else {
            this.errorMessage = 'Producto no encontrado';

            this.router.navigate(['/products']);
          }

          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        },
      });
  }
}
