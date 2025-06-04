import { Component, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs'
import { Product } from 'src/app/core/models/product.model'
import { ProductService } from 'src/app/core/services/product.service'

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss'],
})
export class ProductsPageComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  itemsPerPage = 5;
  isLoading = true;
  errorMessage = '';
  showDeleteModal = false;
  deleteMessage = '';
  productToDelete: Product | null = null;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(private productService: ProductService, private router: Router) {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.filterProducts(searchTerm);
      });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga la lista de productos desde el servicio y actualiza los estados del componente.
   *
   * - Establece el indicador de carga (`isLoading`) en `true` mientras se realiza la petición.
   * - Limpia cualquier mensaje de error previo.
   * - Suscribe al observable que obtiene los productos y actualiza las propiedades `products` y `filteredProducts` con los datos recibidos.
   * - Si ocurre un error durante la carga, actualiza el mensaje de error (`errorMessage`) y desactiva el indicador de carga.
   * - Utiliza `takeUntil(this.destroy$)` para cancelar la suscripción cuando el componente se destruye, evitando fugas de memoria.
   */
  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService
      .getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.filteredProducts = products;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        },
      });
  }

  /**
   * Maneja el evento de búsqueda.
   *
   * Este método emite el término de búsqueda actual (`searchTerm`) a través del `searchSubject`,
   * permitiendo que otros componentes o servicios reaccionen a los cambios en el término de búsqueda.
   */
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  /**
   * Filtra la lista de productos según el término de búsqueda proporcionado.
   *
   * Si el término de búsqueda está vacío o solo contiene espacios en blanco,
   * se restauran todos los productos en la lista filtrada. De lo contrario,
   * se filtran los productos cuyo nombre, descripción o identificador contengan
   * el término de búsqueda (ignorando mayúsculas y minúsculas).
   *
   * @param searchTerm - El término de búsqueda utilizado para filtrar los productos.
   */
  private filterProducts(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredProducts = this.products;
    } else {
      const term = searchTerm.toLowerCase();

      this.filteredProducts = this.products.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.id.toLowerCase().includes(term)
      );
    }
  }

  /**
   * Navega a la página de edición del producto seleccionado.
   *
   * @param product El producto que se desea editar.
   */
  onEditProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  /**
   * Maneja la acción de eliminar un producto.
   *
   * Este método establece el producto seleccionado para eliminar,
   * actualiza el mensaje de confirmación y muestra el modal de eliminación.
   *
   * @param product El producto que se desea eliminar.
   */
  onDeleteProduct(product: Product): void {
    this.productToDelete = product;
    this.deleteMessage = `¿Estas seguro de eliminar el producto ${product.name}?`;
    this.showDeleteModal = true;
  }

  /**
   * Confirma la eliminación de un producto seleccionado.
   *
   * Si existe un producto seleccionado para eliminar (`productToDelete`),
   * llama al servicio para eliminarlo utilizando su identificador.
   * Al completarse exitosamente la eliminación, cierra el modal de confirmación,
   * limpia la referencia al producto eliminado y recarga la lista de productos.
   *
   * En caso de error durante la eliminación, muestra el mensaje de error
   * correspondiente y cierra el modal de confirmación.
   */
  confirmDelete(): void {
    if (this.productToDelete) {
      this.productService
        .deleteProduct(this.productToDelete.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showDeleteModal = false;
            this.productToDelete = null;
            this.loadProducts();
          },
          error: (error) => {
            this.errorMessage = error.message;
            this.showDeleteModal = false;
          },
        });
    }
  }

  /**
   * Cancela la operación de eliminación de un producto.
   * Oculta el modal de confirmación de eliminación y limpia la referencia
   * al producto que se iba a eliminar.
   */
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  /**
   * Maneja el evento de cambio en la cantidad de elementos por página.
   *
   * @param itemsPerPage - La nueva cantidad de elementos que se mostrarán por página.
   */
  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
  }
}
