import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'
import { environment } from 'src/environments/environment'
import {
  Product,
  ProductCreateResponse,
  ProductDeleteResponse,
  ProductResponse,
  ProductUpdateResponse
} from '../models/product.model'

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = `${environment.apiUrl}/products`;
  private productsSubject = new BehaviorSubject<Product[]>([]);

  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de productos desde el servidor.
   *
   * Realiza una solicitud HTTP GET al endpoint configurado en `baseUrl` y retorna un observable con el arreglo de productos.
   * Además, actualiza el subject interno `productsSubject` con los productos obtenidos.
   * Si ocurre un error durante la solicitud, se maneja mediante el método `handleError`.
   *
   * @returns {Observable<Product[]>} Un observable que emite un arreglo de productos.
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<ProductResponse>(this.baseUrl).pipe(
      map((response) => response.data),
      tap((products) => this.productsSubject.next(products)),
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo producto enviando una solicitud POST al servidor.
   *
   * @param product - Objeto que contiene los datos del producto a crear, excluyendo el campo 'id' original pero incluyendo un nuevo 'id'.
   * @returns Un Observable que emite el producto creado.
   *
   * Al completar la operación, actualiza la lista de productos y maneja posibles errores.
   */
  createProduct(
    product: Omit<Product, 'id'> & { id: string }
  ): Observable<Product> {
    return this.http.post<ProductCreateResponse>(this.baseUrl, product).pipe(
      map((response) => response.data),
      tap(() => this.refreshProducts()),
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un producto existente en el servidor.
   *
   * @param id - El identificador único del producto a actualizar.
   * @param product - Un objeto que contiene los nuevos datos del producto, excluyendo el campo 'id'.
   * @returns Un Observable que emite el producto actualizado sin el campo 'id'.
   *
   * @remarks
   * Al completar la actualización, se refresca la lista de productos.
   * Si ocurre un error durante la operación, se maneja mediante el método handleError.
   */
  updateProduct(
    id: string,
    product: Omit<Product, 'id'>
  ): Observable<Omit<Product, 'id'>> {
    return this.http
      .put<ProductUpdateResponse>(`${this.baseUrl}/${id}`, product)
      .pipe(
        map((response) => response.data),
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un producto por su identificador.
   *
   * Envía una solicitud HTTP DELETE al backend para eliminar el producto especificado por el ID.
   * Al completarse exitosamente, emite el mensaje de respuesta del backend.
   * Además, actualiza la lista de productos localmente tras la eliminación.
   *
   * @param id - El identificador único del producto a eliminar.
   * @returns Un Observable que emite el mensaje de confirmación de la eliminación.
   */
  deleteProduct(id: string): Observable<string> {
    return this.http
      .delete<ProductDeleteResponse>(`${this.baseUrl}/${id}`)
      .pipe(
        map((response) => response.message),
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

  /**
   * Verifica si un producto con el ID proporcionado existe en el sistema.
   *
   * Realiza una solicitud HTTP GET al endpoint de verificación utilizando el ID del producto.
   * Devuelve un observable que emite `true` si el producto existe, o `false` en caso contrario.
   * Si ocurre un error durante la solicitud, el error es manejado por el método `handleError`.
   *
   * @param id - El identificador único del producto a verificar.
   * @returns Un observable que emite un valor booleano indicando si el producto existe.
   */
  verifyProductId(id: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.baseUrl}/verification/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene un producto por su identificador único.
   *
   * @param id - El identificador único del producto a buscar.
   * @returns Un observable que emite el producto correspondiente si se encuentra, o `undefined` en caso contrario.
   */
  getProductById(id: string): Observable<Product | undefined> {
    return this.products$.pipe(
      map((products) => products.find((product) => product.id === id))
    );
  }

  /**
   * Actualiza la lista de productos obteniéndolos nuevamente desde el servicio.
   *
   * Este método llama al método `getProducts()` y se suscribe a su observable,
   * lo que provoca que se realice la petición para obtener los productos más recientes.
   * No retorna ningún valor ni maneja la respuesta directamente.
   */
  private refreshProducts(): void {
    this.getProducts().subscribe();
  }

  /**
   * Maneja los errores de las solicitudes HTTP y genera un mensaje de error adecuado.
   *
   * Este método interpreta el objeto de error recibido y devuelve un observable que lanza
   * un error con un mensaje personalizado según el tipo y estado del error HTTP.
   *
   * - Si el error es del tipo ErrorEvent, se muestra el mensaje del evento.
   * - Si el error tiene un estado 400 y contiene un mensaje, se utiliza ese mensaje.
   * - Si el error tiene un estado 404, se indica que el producto no fue encontrado.
   * - Si el error tiene un estado 0, se informa que no se puede conectar con el servidor.
   * - En cualquier otro caso, se muestra un mensaje genérico de error inesperado.
   *
   * @param error El objeto HttpErrorResponse recibido de la petición HTTP fallida.
   * @returns Un observable que lanza un error con el mensaje correspondiente.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 400 && error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 404) {
        errorMessage = 'Producto no encontrado';
      } else if (error.status === 0) {
        errorMessage =
          'No se puede conectar con el servidor. Verifique que el backend esté ejecutándose en http://localhost:3002';
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
