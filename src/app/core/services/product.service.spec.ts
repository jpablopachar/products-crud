import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { environment } from 'src/environments/environment'
import { Product, ProductCreateResponse, ProductDeleteResponse, ProductResponse, ProductUpdateResponse } from '../models/product.model'
import { ProductService } from './product.service'

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/products`;

  const mockProducts: Product[] = [
    {
      id: 'test-1',
      name: 'Test Product 1',
      description: 'Test Description 1',
      logo: 'https://example.com/logo1.jpg',
      date_release: '2024-01-01',
      date_revision: '2025-01-01'
    },
    {
      id: 'test-2',
      name: 'Test Product 2',
      description: 'Test Description 2',
      logo: 'https://example.com/logo2.jpg',
      date_release: '2024-02-01',
      date_revision: '2025-02-01'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getProducts', () => {
    it('should retrieve products from the API', () => {
      const mockResponse: ProductResponse = { data: mockProducts };

      service.getProducts().subscribe(products => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(2);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should update products subject when products are fetched', () => {
      const mockResponse: ProductResponse = { data: mockProducts };
      let emittedProducts: Product[] = [];

      service.products$.subscribe(products => {
        emittedProducts = products;
      });

      service.getProducts().subscribe();

      const req = httpMock.expectOne(baseUrl);
      req.flush(mockResponse);

      expect(emittedProducts).toEqual(mockProducts);
    });

    it('should handle error when getting products', () => {
      service.getProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('error inesperado');
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('createProduct', () => {
    it('should create a new product', () => {
      const newProduct = { 
        id: 'new-product',
        name: 'New Product',
        description: 'New Description',
        logo: 'https://example.com/logo.jpg',
        date_release: '2024-03-01',
        date_revision: '2025-03-01'
      };
      const mockResponse: ProductCreateResponse = {
        message: 'Product added successfully',
        data: newProduct
      };

      service.createProduct(newProduct).subscribe(product => {
        expect(product).toEqual(newProduct);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      req.flush(mockResponse);

      // Expect the refresh call
      const refreshReq = httpMock.expectOne(baseUrl);
      expect(refreshReq.request.method).toBe('GET');
      refreshReq.flush({ data: [newProduct] });
    });

    it('should handle validation errors when creating product', () => {
      const newProduct = { 
        id: 'invalid',
        name: 'New Product',
        description: 'New Description',
        logo: 'https://example.com/logo.jpg',
        date_release: '2024-03-01',
        date_revision: '2025-03-01'
      };

      service.createProduct(newProduct).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBeDefined();
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(
        { message: 'Invalid body', errors: ['ID is invalid'] },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', () => {
      const productId = 'test-1';
      const updateData = {
        name: 'Updated Product',
        description: 'Updated Description',
        logo: 'https://example.com/updated-logo.jpg',
        date_release: '2024-04-01',
        date_revision: '2025-04-01'
      };
      const mockResponse: ProductUpdateResponse = {
        message: 'Product updated successfully',
        data: updateData
      };

      service.updateProduct(productId, updateData).subscribe(result => {
        expect(result).toEqual(updateData);
      });

      const req = httpMock.expectOne(`${baseUrl}/${productId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);

      // Expect the refresh call
      const refreshReq = httpMock.expectOne(baseUrl);
      expect(refreshReq.request.method).toBe('GET');
      refreshReq.flush({ data: mockProducts });
    });

    it('should handle 404 error when updating non-existent product', () => {
      const productId = 'non-existent';
      const updateData = {
        name: 'Updated Product',
        description: 'Updated Description',
        logo: 'https://example.com/logo.jpg',
        date_release: '2024-04-01',
        date_revision: '2025-04-01'
      };

      service.updateProduct(productId, updateData).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Producto no encontrado');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/${productId}`);
      req.flush(
        { message: 'Not product found with that identifier' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', () => {
      const productId = 'test-1';
      const mockResponse: ProductDeleteResponse = {
        message: 'Product removed successfully'
      };

      service.deleteProduct(productId).subscribe(message => {
        expect(message).toBe('Product removed successfully');
      });

      const req = httpMock.expectOne(`${baseUrl}/${productId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);

      // Expect the refresh call
      const refreshReq = httpMock.expectOne(baseUrl);
      expect(refreshReq.request.method).toBe('GET');
      refreshReq.flush({ data: mockProducts });
    });

    it('should handle error when deleting product', () => {
      const productId = 'non-existent';

      service.deleteProduct(productId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Producto no encontrado');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/${productId}`);
      req.flush(
        { message: 'Not product found with that identifier' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('verifyProductId', () => {
    it('should return true when product exists', () => {
      const productId = 'existing-id';

      service.verifyProductId(productId).subscribe(exists => {
        expect(exists).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/verification/${productId}`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should return false when product does not exist', () => {
      const productId = 'non-existing-id';

      service.verifyProductId(productId).subscribe(exists => {
        expect(exists).toBe(false);
      });

      const req = httpMock.expectOne(`${baseUrl}/verification/${productId}`);
      req.flush(false);
    });

    it('should handle error when verifying product ID', () => {
      const productId = 'error-id';

      service.verifyProductId(productId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('error inesperado');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/verification/${productId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getProductById', () => {
    it('should return product when found', () => {
      // First populate the products
      service.getProducts().subscribe();
      const req = httpMock.expectOne(baseUrl);
      req.flush({ data: mockProducts });

      // Then test getProductById
      service.getProductById('test-1').subscribe(product => {
        expect(product).toEqual(mockProducts[0]);
      });
    });

    it('should return undefined when product not found', () => {
      // First populate the products
      service.getProducts().subscribe();
      const req = httpMock.expectOne(baseUrl);
      req.flush({ data: mockProducts });

      // Then test getProductById with non-existent ID
      service.getProductById('non-existent').subscribe(product => {
        expect(product).toBeUndefined();
      });
    });
  });

  describe('Error handling', () => {
    it('should handle network error (status 0)', () => {
      service.getProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('No se puede conectar con el servidor');
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Network error', { status: 0, statusText: 'Network Error' });
    });

    it('should handle client-side error', () => {
      service.getProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('Error:');
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.error(new ErrorEvent('Network error', { message: 'Client-side error' }));
    });
  });
});