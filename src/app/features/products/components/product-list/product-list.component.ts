import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core'
import { Product } from 'src/app/core/models/product.model'

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnChanges {
  /**
   * Lista de productos que se mostrarán en el componente.
   */
  @Input() products: Product[] = [];
  /**
   * Número de productos a mostrar por página.
   *
   * Permite paginar la lista de productos para una mejor visualización.
   */
  @Input() itemsPerPage = 5;

  /**
   * Evento emitido cuando se solicita editar un producto.
   *
   * Contiene el producto que se desea editar.
   */
  @Output() edit = new EventEmitter<Product>();
  /**
   * Evento emitido cuando se solicita eliminar un producto.
   *
   * Contiene el producto que se desea eliminar.
   */
  @Output() delete = new EventEmitter<Product>();
  /**
   * Evento emitido cuando se cambia el número de productos por página.
   *
   * Permite actualizar la paginación de la lista de productos.
   */
  @Output() itemsPerPageChange = new EventEmitter<number>();

  paginatedProducts: Product[] = [];
  totalResults = 0;
  openDropdownId: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products'] || changes['itemsPerPage']) {
      this.updatePaginatedProducts();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.openDropdownId = null;
  }

  /**
   * Alterna la visibilidad del menú desplegable asociado a un producto específico.
   *
   * Si se proporciona un evento, detiene su propagación para evitar efectos secundarios no deseados.
   * Cambia el identificador del menú desplegable abierto: si el menú del producto ya está abierto, lo cierra;
   * de lo contrario, abre el menú del producto seleccionado.
   *
   * @param productId - El identificador del producto cuyo menú desplegable se va a alternar.
   * @param event - (Opcional) El evento que desencadenó la acción, utilizado para detener su propagación.
   */
  toggleDropdown(productId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.openDropdownId = this.openDropdownId === productId ? null : productId;
  }

  /**
   * Maneja el evento de edición de un producto.
   *
   * Este método cierra cualquier menú desplegable abierto y emite el producto seleccionado
   * para su edición a través del evento `edit`.
   *
   * @param product El producto que se va a editar.
   */
  onEdit(product: Product): void {
    this.openDropdownId = null;

    this.edit.emit(product);
  }

  /**
   * Maneja la eliminación de un producto.
   *
   * Este método se invoca cuando el usuario solicita eliminar un producto de la lista.
   * Cierra cualquier menú desplegable abierto y emite un evento para notificar la eliminación del producto seleccionado.
   *
   * @param product El producto que se desea eliminar.
   */
  onDelete(product: Product): void {
    this.openDropdownId = null;

    this.delete.emit(product);
  }

  /**
   * Maneja el evento cuando el usuario cambia la cantidad de elementos por página.
   *
   * Este método emite el nuevo valor de `itemsPerPage` a través del evento `itemsPerPageChange`
   * y actualiza la lista paginada de productos llamando a `updatePaginatedProducts`.
   */
  onItemsPerPageChange(): void {
    this.itemsPerPageChange.emit(this.itemsPerPage);

    this.updatePaginatedProducts();
  }

  /**
   * Función de seguimiento (trackBy) utilizada en directivas estructurales de Angular como *ngFor.
   * Permite optimizar el rendimiento de la lista de productos identificando cada elemento por su ID único.
   *
   * @param index - Índice del elemento en la lista.
   * @param product - Objeto de tipo Product correspondiente al elemento actual.
   * @returns El identificador único del producto como string.
   */
  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  /**
   * Formatea una cadena de fecha en formato 'dd/mm/aaaa' según la configuración regional española ('es-ES').
   *
   * @param dateString - La fecha en formato de cadena que se desea formatear.
   * @returns La fecha formateada como una cadena en formato 'dd/mm/aaaa'.
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Maneja el evento de error al cargar una imagen.
   *
   * Este método se ejecuta cuando ocurre un error al cargar una imagen en la lista de productos.
   * Reemplaza la imagen que falló por una imagen SVG predeterminada codificada en base64.
   *
   * @param event El evento de error generado por el elemento de imagen (<img>).
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNMjAgMTJDMTguOSAxMiAxOCAxMi45IDE4IDE0VjI2QzE4IDI3LjEgMTguOSAyOCAyMCAyOEMyMS4xIDI4IDIyIDI3LjEgMjIgMjZWMTRDMjIgMTIuOSAyMS4xIDEyIDIwIDEyWiIgZmlsbD0iIzlDQTNBRiIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjMxIiByPSIyIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
  }

  /**
   * Actualiza la lista de productos paginados y el total de resultados.
   *
   * Este método asigna el número total de productos a la propiedad `totalResults`
   * y selecciona los productos correspondientes a la primera página, según el valor
   * de `itemsPerPage`, asignándolos a la propiedad `paginatedProducts`.
   *
   * @private
   */
  private updatePaginatedProducts(): void {
    this.totalResults = this.products.length;
    this.paginatedProducts = this.products.slice(0, this.itemsPerPage);
  }
}
