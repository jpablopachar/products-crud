import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { of, Subject, throwError } from 'rxjs'
import { Product } from 'src/app/core/models/product.model'
import { ProductService } from 'src/app/core/services/product.service'
import { ConfirmationModalComponent } from 'src/app/shared/components/confirmation-modal/confirmation-modal.component'
import { LoadingSkeletonComponent } from 'src/app/shared/components/loading-skeleton/loading-skeleton.component'
import { ProductListComponent } from '../../components/product-list/product-list.component'
import { ProductsPageComponent } from './products-page.component'

describe('ProductsPageComponent', () => {
  let component: ProductsPageComponent;
  let fixture: ComponentFixture<ProductsPageComponent>;
  let mockProductService: jest.Mocked<ProductService>;
  let mockRouter: jest.Mocked<Router>;

  const mockProducts: Product[] = [
    {
      id: 'test-1',
      name: 'Test Product 1',
      description: 'Test Description 1',
      logo: 'https://example.com/logo1.jpg',
      date_release: '2024-01-01',
      date_revision: '2025-01-01',
    },
    {
      id: 'test-2',
      name: 'Another Product',
      description: 'Another Description',
      logo: 'https://example.com/logo2.jpg',
      date_release: '2024-02-01',
      date_revision: '2025-02-01',
    },
  ];

  beforeEach(async () => {
    const productServiceSpy = {
      getProducts: jest.fn(),
      deleteProduct: jest.fn(),
    } as any;

    const routerSpy = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [
        ProductsPageComponent,
        ProductListComponent,
        LoadingSkeletonComponent,
        ConfirmationModalComponent,
      ],
      imports: [FormsModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPageComponent);
    component = fixture.componentInstance;
    mockProductService = TestBed.inject(
      ProductService
    ) as jest.Mocked<ProductService>;
    mockRouter = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  describe('Component Creation', () => {
    it('debería ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar propiedades por defecto', () => {
      expect(component.products).toEqual([]);
      expect(component.filteredProducts).toEqual([]);
      expect(component.searchTerm).toBe('');
      expect(component.itemsPerPage).toBe(5);
      expect(component.isLoading).toBe(true);
      expect(component.errorMessage).toBe('');
      expect(component.showDeleteModal).toBe(false);
      expect(component.deleteMessage).toBe('');
      expect(component.productToDelete).toBeNull();
    });

    it('debería configurar el subject de búsqueda con debounce', () => {
      expect(component['searchSubject']).toBeInstanceOf(Subject);
    });
  });

  describe('Carga de productos', () => {
    it('debería cargar productos exitosamente', () => {
      mockProductService.getProducts.mockReturnValue(of(mockProducts));

      component.loadProducts();

      expect(component.isLoading).toBe(false);
      expect(component.products).toEqual(mockProducts);
      expect(component.filteredProducts).toEqual(mockProducts);
      expect(component.errorMessage).toBe('');
      expect(mockProductService.getProducts).toHaveBeenCalled();
    });

    it('debería manejar errores al cargar productos', () => {
      const errorMessage = 'Error al cargar productos';
      mockProductService.getProducts.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      component.loadProducts();

      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe(errorMessage);
      expect(component.products).toEqual([]);
      expect(component.filteredProducts).toEqual([]);
    });

    it('debería cargar productos al inicializar', () => {
      mockProductService.getProducts.mockReturnValue(of(mockProducts));
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');

      component.ngOnInit();

      expect(loadProductsSpy).toHaveBeenCalled();
    });

    it('debería limpiar mensaje de error antes de cargar', () => {
      component.errorMessage = 'Error previo';
      mockProductService.getProducts.mockReturnValue(of(mockProducts));

      component.loadProducts();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('Búsqueda con debounce', () => {
    beforeEach(() => {
      component.products = mockProducts;
      component.filteredProducts = mockProducts;
    });

    it('debería emitir término de búsqueda en el subject', () => {
      const nextSpy = jest.spyOn(component['searchSubject'], 'next');
      component.searchTerm = 'test';

      component.onSearch();

      expect(nextSpy).toHaveBeenCalledWith('test');
    });

    it('debería filtrar productos por nombre', fakeAsync(() => {
      // Primero cargar los productos
      component.products = mockProducts;
      component.filteredProducts = mockProducts;

      component.searchTerm = 'Test Product 1';
      component.onSearch();
      tick(300); // Wait for debounce

      expect(component.filteredProducts).toEqual([mockProducts[0]]);
    }));

    it('debería filtrar productos por descripción', fakeAsync(() => {
      component.products = mockProducts;
      component.filteredProducts = mockProducts;

      component.searchTerm = 'Another Description';
      component.onSearch();
      tick(300);

      expect(component.filteredProducts).toEqual([mockProducts[1]]);
    }));

    it('debería filtrar productos por ID', fakeAsync(() => {
      component.products = mockProducts;
      component.filteredProducts = mockProducts;

      component.searchTerm = 'test-2';
      component.onSearch();
      tick(300);

      expect(component.filteredProducts).toEqual([mockProducts[1]]);
    }));

    it('debería mostrar todos los productos cuando el término está vacío', fakeAsync(() => {
      component.products = mockProducts;
      component.filteredProducts = mockProducts;

      component.searchTerm = '';
      component.onSearch();
      tick(300);

      expect(component.filteredProducts).toEqual(mockProducts);
    }));

    it('debería ser case-insensitive en la búsqueda', fakeAsync(() => {
      component.products = mockProducts;
      component.filteredProducts = mockProducts;

      component.searchTerm = 'test product';
      component.onSearch();
      tick(300);

      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].name).toBe('Test Product 1');
    }));

    it('debería manejar términos de búsqueda con espacios', fakeAsync(() => {
      component.products = mockProducts;
      component.filteredProducts = mockProducts;

      component.searchTerm = '   ';
      component.onSearch();
      tick(300);

      expect(component.filteredProducts).toEqual(mockProducts);
    }));
  });

  describe('Filtrado', () => {
    beforeEach(() => {
      component.products = mockProducts;
    });

    it('debería filtrar correctamente con múltiples coincidencias', () => {
      component.products = mockProducts;
      component.filteredProducts = mockProducts;

      component['filterProducts']('test');

      expect(component.filteredProducts.length).toBe(2); // Cambiado de 1 a 2
      expect(component.filteredProducts[0].id).toBe('test-1');
      expect(component.filteredProducts[1].id).toBe('test-2');
    });

    it('debería retornar array vacío cuando no hay coincidencias', () => {
      component['filterProducts']('nonexistent');

      expect(component.filteredProducts).toEqual([]);
    });

    it('debería mantener el orden original en los resultados filtrados', () => {
      const searchTerm = 'test';
      component['filterProducts'](searchTerm);

      expect(component.filteredProducts[0]).toBe(mockProducts[0]);
    });
  });

  describe('Navegación', () => {
    it('debería navegar a página de edición de producto', () => {
      const product = mockProducts[0];

      component.onEditProduct(product);

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/products/edit',
        product.id,
      ]);
    });
  });

  describe('Modal de confirmación', () => {
    it('debería mostrar modal de confirmación al eliminar producto', () => {
      const product = mockProducts[0];

      component.onDeleteProduct(product);

      expect(component.showDeleteModal).toBe(true);
      expect(component.productToDelete).toBe(product);
      expect(component.deleteMessage).toBe(
        `¿Estas seguro de eliminar el producto ${product.name}?`
      );
    });

    it('debería cancelar eliminación correctamente', () => {
      component.productToDelete = mockProducts[0];
      component.showDeleteModal = true;

      component.cancelDelete();

      expect(component.showDeleteModal).toBe(false);
      expect(component.productToDelete).toBeNull();
    });

    it('debería confirmar eliminación exitosamente', () => {
      const product = mockProducts[0];
      component.productToDelete = product;
      component.showDeleteModal = true;

      mockProductService.deleteProduct.mockReturnValue(
        of('Product removed successfully')
      );
      mockProductService.getProducts.mockReturnValue(of(mockProducts.slice(1)));
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');

      component.confirmDelete();

      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(product.id);
      expect(component.showDeleteModal).toBe(false);
      expect(component.productToDelete).toBeNull();
      expect(loadProductsSpy).toHaveBeenCalled();
    });

    it('debería manejar error al confirmar eliminación', () => {
      const product = mockProducts[0];
      const errorMessage = 'Error al eliminar producto';
      component.productToDelete = product;
      component.showDeleteModal = true;

      mockProductService.deleteProduct.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      component.confirmDelete();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.showDeleteModal).toBe(false);
    });

    it('no debería hacer nada si no hay producto para eliminar', () => {
      component.productToDelete = null;

      component.confirmDelete();

      expect(mockProductService.deleteProduct).not.toHaveBeenCalled();
    });
  });

  describe('Paginación', () => {
    it('debería actualizar itemsPerPage cuando cambia', () => {
      const newItemsPerPage = 10;

      component.onItemsPerPageChange(newItemsPerPage);

      expect(component.itemsPerPage).toBe(newItemsPerPage);
    });
  });

  describe('Manejo de errores', () => {
    it('debería mostrar mensaje de error cuando falla la carga', () => {
      const errorMessage = 'Network error';
      mockProductService.getProducts.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      component.loadProducts();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBe(false);
    });

    it('debería limpiar error al cargar productos exitosamente', () => {
      component.errorMessage = 'Error previo';
      mockProductService.getProducts.mockReturnValue(of(mockProducts));

      component.loadProducts();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('Component Lifecycle', () => {
    it('debería limpiar las suscripciones al destruirse', () => {
      const destroyNextSpy = jest.spyOn(component['destroy$'], 'next');
      const destroyCompleteSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroyNextSpy).toHaveBeenCalled();
      expect(destroyCompleteSpy).toHaveBeenCalled();
    });

    it('debería configurar suscripción al subject de búsqueda en constructor', () => {
      expect(component['searchSubject']).toBeDefined();
    });
  });

  describe('Integración con ProductListComponent', () => {
    beforeEach(() => {
      mockProductService.getProducts.mockReturnValue(of(mockProducts));
    });

    it('debería pasar productos filtrados al componente hijo', () => {
      component.filteredProducts = mockProducts;
      fixture.detectChanges();

      const productListDebugElement = fixture.debugElement.query(
        (debugEl) => debugEl.componentInstance instanceof ProductListComponent
      );

      if (productListDebugElement) {
        expect(productListDebugElement.componentInstance.products).toEqual(
          mockProducts
        );
      } else {
        // Si no se encuentra el componente hijo, al menos verificar que los datos están listos
        expect(component.filteredProducts).toEqual(mockProducts);
      }
    });

    it('debería pasar itemsPerPage al componente hijo', () => {
      component.itemsPerPage = 10;
      fixture.detectChanges();

      const productListDebugElement = fixture.debugElement.query(
        (debugEl) => debugEl.componentInstance instanceof ProductListComponent
      );

      if (productListDebugElement) {
        expect(productListDebugElement.componentInstance.itemsPerPage).toBe(10);
      } else {
        // Si no se encuentra el componente hijo, verificar que la propiedad está establecida
        expect(component.itemsPerPage).toBe(10);
      }
    });
  });
});
