import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'
import {
  Product, ProductCreateResponse, ProductDeleteResponse, ProductResponse, ProductUpdateResponse
} from '../models/product.model'

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = 'http://localhost:3002/bp/products';
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // F1: Obtener todos los productos
  getProducts(): Observable<Product[]> {
    return this.http.get<ProductResponse>(this.baseUrl).pipe(
      map((response) => response.data),
      tap((products) => this.productsSubject.next(products)),
      catchError(this.handleError)
    );
  }

  // F4: Crear producto
  createProduct(
    product: Omit<Product, 'id'> & { id: string }
  ): Observable<Product> {
    return this.http.post<ProductCreateResponse>(this.baseUrl, product).pipe(
      map((response) => response.data),
      tap(() => this.refreshProducts()),
      catchError(this.handleError)
    );
  }

  // F5: Actualizar producto
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

  // F6: Eliminar producto
  deleteProduct(id: string): Observable<string> {
    return this.http
      .delete<ProductDeleteResponse>(`${this.baseUrl}/${id}`)
      .pipe(
        map((response) => response.message),
        tap(() => this.refreshProducts()),
        catchError(this.handleError)
      );
  }

  // Verificar si ID existe
  verifyProductId(id: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.baseUrl}/verification/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener producto por ID
  getProductById(id: string): Observable<Product | undefined> {
    return this.products$.pipe(
      map((products) => products.find((product) => product.id === id))
    );
  }

  private refreshProducts(): void {
    this.getProducts().subscribe();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
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
