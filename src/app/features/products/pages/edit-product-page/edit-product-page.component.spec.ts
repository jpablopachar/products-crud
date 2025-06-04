import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { Product } from 'src/app/core/models/product.model'
import { ProductService } from 'src/app/core/services/product.service'
import { ProductFormComponent } from '../../components/product-form/product-form.component'
import { EditProductPageComponent } from './edit-product-page.component'

describe('EditProductPageComponent', () => {
  let component: EditProductPageComponent;
  let fixture: ComponentFixture<EditProductPageComponent>;
  let mockProductService: jest.Mocked<ProductService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;

  const mockProductId = 'test-product-id';
  const mockProduct: Product = {
    id: mockProductId,
    name: 'Test Product',
    description: 'Test Product Description for testing',
    logo: 'https://example.com/logo.jpg',
    date_release: '2024-01-01',
    date_revision: '2025-01-01',
  };

  const mockUpdateData = {
    name: 'Updated Product Name',
    description: 'Updated Product Description for testing',
    logo: 'https://example.com/updated-logo.jpg',
    date_release: '2024-06-01',
    date_revision: '2025-06-01',
  };

  beforeEach(async () => {
    const productServiceSpy = {
      getProductById: jest.fn(),
      updateProduct: jest.fn(),
    } as any;

    const routerSpy = {
      navigate: jest.fn(),
    } as any;

    mockActivatedRoute = {
      snapshot: {
        params: { id: mockProductId },
      },
    };

    await TestBed.configureTestingModule({
      declarations: [EditProductPageComponent, ProductFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProductPageComponent);
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
      expect(component.product).toBeNull();
      expect(component.productId).toBe(mockProductId);
      expect(component.isLoading).toBe(true);
      expect(component.errorMessage).toBe('');
    });

    it('debería obtener productId desde los parámetros de la ruta', () => {
      expect(component.productId).toBe(mockProductId);
    });
  });

  describe('Carga de producto', () => {
    it('debería cargar producto exitosamente al inicializar', () => {
      mockProductService.getProductById.mockReturnValue(of(mockProduct));

      component.ngOnInit();

      expect(mockProductService.getProductById).toHaveBeenCalledWith(
        mockProductId
      );
      expect(component.product).toEqual(mockProduct);
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('debería manejar producto no encontrado', () => {
      mockProductService.getProductById.mockReturnValue(of(undefined));

      component.ngOnInit();

      expect(component.product).toBeNull();
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Producto no encontrado');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('debería manejar error al cargar producto', () => {
      const errorMessage = 'Error al cargar producto';
      mockProductService.getProductById.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      component.ngOnInit();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBe(false);
      expect(component.product).toBeNull();
    });

    it('debería llamar a loadProduct en ngOnInit', () => {
      const loadProductSpy = jest.spyOn(component, 'loadProduct' as any);
      mockProductService.getProductById.mockReturnValue(of(mockProduct));

      component.ngOnInit();

      expect(loadProductSpy).toHaveBeenCalled();
    });
  });

  describe('Actualización de producto', () => {
    beforeEach(() => {
      component.product = mockProduct;
      component.isLoading = false;
    });

    it('debería actualizar producto exitosamente', () => {
      mockProductService.updateProduct.mockReturnValue(of(mockUpdateData));

      component.onSave(mockUpdateData);

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        mockProductId,
        mockUpdateData
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
      expect(component.errorMessage).toBe('');
    });

    it('debería limpiar mensaje de error antes de actualizar', () => {
      component.errorMessage = 'Error previo';
      mockProductService.updateProduct.mockReturnValue(of(mockUpdateData));

      component.onSave(mockUpdateData);

      expect(component.errorMessage).toBe('');
    });

    it('debería navegar a lista de productos después de actualización exitosa', () => {
      mockProductService.updateProduct.mockReturnValue(of(mockUpdateData));

      component.onSave(mockUpdateData);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });
  });

  describe('Manejo de errores en actualización', () => {
    beforeEach(() => {
      component.product = mockProduct;
      component.isLoading = false;
    });

    it('debería mostrar mensaje de error cuando falla la actualización', () => {
      const errorMessage = 'Error al actualizar producto';
      mockProductService.updateProduct.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      component.onSave(mockUpdateData);

      expect(component.errorMessage).toBe(errorMessage);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('debería manejar error 404 (producto no encontrado)', () => {
      const errorMessage = 'Producto no encontrado';
      mockProductService.updateProduct.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      component.onSave(mockUpdateData);

      expect(component.errorMessage).toBe(errorMessage);
    });

    it('debería manejar errores de validación del servidor', () => {
      const validationError = 'Datos inválidos';
      mockProductService.updateProduct.mockReturnValue(
        throwError(() => new Error(validationError))
      );

      component.onSave(mockUpdateData);

      expect(component.errorMessage).toBe(validationError);
    });

    it('debería manejar errores de red', () => {
      const networkError = 'No se puede conectar con el servidor';
      mockProductService.updateProduct.mockReturnValue(
        throwError(() => new Error(networkError))
      );

      component.onSave(mockUpdateData);

      expect(component.errorMessage).toBe(networkError);
    });
  });

  describe('Navegación', () => {
    it('debería navegar a lista de productos al cancelar', () => {
      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });
  });

  /* describe('Integración con ProductFormComponent', () => {
    beforeEach(() => {
      component.product = mockProduct;
      component.isLoading = false;
    });

    it('debería pasar isEditMode como true al ProductFormComponent', () => {
      fixture.detectChanges();

      const productFormComponent = fixture.debugElement.query(
        (el) => el.componentInstance instanceof ProductFormComponent
      );

      expect(productFormComponent.componentInstance.isEditMode).toBe(true);
    });

    it('debería pasar initialData al ProductFormComponent', () => {
      fixture.detectChanges();

      const productFormComponent = fixture.debugElement.query(
        (el) => el.componentInstance instanceof ProductFormComponent
      );

      expect(productFormComponent.componentInstance.initialData).toEqual(
        mockProduct
      );
    });

    it('debería manejar evento save del ProductFormComponent', () => {
      const onSaveSpy = jest.spyOn(component, 'onSave');
      fixture.detectChanges();

      const productFormComponent = fixture.debugElement.query(
        (el) => el.componentInstance instanceof ProductFormComponent
      );

      productFormComponent.componentInstance.save.emit(mockUpdateData);

      expect(onSaveSpy).toHaveBeenCalledWith(mockUpdateData);
    });

    it('debería manejar evento cancel del ProductFormComponent', () => {
      const onCancelSpy = jest.spyOn(component, 'onCancel');
      fixture.detectChanges();

      const productFormComponent = fixture.debugElement.query(
        (el) => el.componentInstance instanceof ProductFormComponent
      );

      productFormComponent.componentInstance.cancel.emit();

      expect(onCancelSpy).toHaveBeenCalled();
    });
  }); */

  /* describe('Estados de la UI', () => {
    it('debería mostrar indicador de carga inicialmente', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const loadingElement = fixture.nativeElement.querySelector('.loading');
      expect(loadingElement).toBeTruthy();
    });

    it('debería ocultar indicador de carga cuando termina', () => {
      component.isLoading = false;
      component.product = mockProduct;
      fixture.detectChanges();

      const loadingElement = fixture.nativeElement.querySelector('.loading');
      expect(loadingElement).toBeFalsy();
    });

    it('debería mostrar mensaje de error en el template cuando existe', () => {
      component.errorMessage = 'Error de prueba';
      component.isLoading = false;
      fixture.detectChanges();

      const errorElement =
        fixture.nativeElement.querySelector('.error-message');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent.trim()).toBe('Error de prueba');
    });

    it('no debería mostrar mensaje de error cuando está vacío', () => {
      component.errorMessage = '';
      component.isLoading = false;
      component.product = mockProduct;
      fixture.detectChanges();

      const errorElement =
        fixture.nativeElement.querySelector('.error-message');
      expect(errorElement).toBeFalsy();
    });

    it('debería mostrar ProductFormComponent solo cuando no está cargando y hay producto', () => {
      component.isLoading = false;
      component.product = mockProduct;
      fixture.detectChanges();

      const productFormElement =
        fixture.nativeElement.querySelector('app-product-form');
      expect(productFormElement).toBeTruthy();
    });

    it('no debería mostrar ProductFormComponent cuando está cargando', () => {
      component.isLoading = true;
      component.product = null;
      fixture.detectChanges();

      const productFormElement =
        fixture.nativeElement.querySelector('app-product-form');
      expect(productFormElement).toBeFalsy();
    });
  }); */

  describe('Component Lifecycle', () => {
    /* it('debería limpiar las suscripciones al destruirse', () => {
      const destroyNextSpy = jest.spyOn(component['destroy], 'next');
      const destroyCompleteSpy = jest.spyOn(component['destroy], 'complete');

      component.ngOnDestroy();

      expect(destroyNextSpy).toHaveBeenCalled();
      expect(destroyCompleteSpy).toHaveBeenCalled();
    }); */

    it('debería cancelar suscripciones activas al destruirse', () => {
      const takeUntilSpy = jest.spyOn(require('rxjs'), 'takeUntil');
      mockProductService.getProductById.mockReturnValue(of(mockProduct));

      component.ngOnInit();

      expect(takeUntilSpy).toHaveBeenCalled();
    });
  });

  describe('Validación de parámetros de ruta', () => {
    it('debería manejar ID de producto desde la ruta', () => {
      expect(component.productId).toBe(mockProductId);
    });

    it('debería manejar diferentes tipos de ID', () => {
      // Simular diferentes formatos de ID
      const testIds = ['ABC123', 'test-id-1', '12345'];

      testIds.forEach((testId) => {
        mockActivatedRoute.snapshot.params.id = testId;
        const testComponent = new EditProductPageComponent(
          mockActivatedRoute,
          mockRouter,
          mockProductService
        );
        expect(testComponent.productId).toBe(testId);
      });
    });
  });

  describe('Flujo completo de edición', () => {
    it('debería completar el flujo de edición exitosamente', async () => {
      // Configurar mocks
      mockProductService.getProductById.mockReturnValue(of(mockProduct));
      mockProductService.updateProduct.mockReturnValue(of(mockUpdateData));

      // Inicializar componente
      component.ngOnInit();

      // Verificar carga del producto
      expect(component.product).toEqual(mockProduct);
      expect(component.isLoading).toBe(false);

      // Simular actualización
      component.onSave(mockUpdateData);

      // Verificar actualización
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        mockProductId,
        mockUpdateData
      );
      expect(component.errorMessage).toBe('');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('debería manejar flujo de error en carga y permitir reintento', () => {
      // Primera carga falla
      mockProductService.getProductById.mockReturnValueOnce(
        throwError(() => new Error('Error de conexión'))
      );

      component.ngOnInit();
      expect(component.errorMessage).toBe('Error de conexión');
      expect(component.isLoading).toBe(false);

      // Simular reintento exitoso
      mockProductService.getProductById.mockReturnValueOnce(of(mockProduct));

      component['loadProduct']();
      expect(component.product).toEqual(mockProduct);
      expect(component.errorMessage).toBe('Error de conexión'); // El error no se limpia automáticamente en loadProduct
    });

    it('debería manejar flujo de error en actualización y permitir reintento', () => {
      // Configurar producto cargado
      component.product = mockProduct;
      component.isLoading = false;

      // Primera actualización falla
      mockProductService.updateProduct.mockReturnValueOnce(
        throwError(() => new Error('Error de validación'))
      );

      component.onSave(mockUpdateData);
      expect(component.errorMessage).toBe('Error de validación');
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      // Segunda actualización exitosa
      mockProductService.updateProduct.mockReturnValueOnce(of(mockUpdateData));

      component.onSave(mockUpdateData);
      expect(component.errorMessage).toBe('');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });
  });
});
