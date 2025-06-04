import { Component, EventEmitter, Input, Output } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { Product } from 'src/app/core/models/product.model'
import { ProductService } from 'src/app/core/services/product.service'
import { EditProductPageComponent } from './edit-product-page.component'

@Component({
  selector: 'app-product-form',
  template: '<div>Mock Product Form</div>',
})
class MockProductFormComponent {
  @Input() isEditMode = false;
  @Input() initialData: Product | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
}

describe('EditProductPageComponent', () => {
  let component: EditProductPageComponent;
  let fixture: ComponentFixture<EditProductPageComponent>;
  let mockProductService: jest.Mocked<ProductService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;

  const mockProduct: Product = {
    id: 'test-product-id',
    name: 'Test Product',
    description: 'Test Product Description for testing',
    logo: 'https://example.com/logo.jpg',
    date_release: '2024-01-01',
    date_revision: '2025-01-01',
  };

  const mockUpdateData = {
    name: 'Updated Product',
    description: 'Updated Product Description for testing',
    logo: 'https://example.com/updated-logo.jpg',
    date_release: '2024-06-01',
    date_revision: '2025-06-01',
  };

  beforeEach(async () => {
    const productServiceSpy = {
      getProductById: jest.fn(),
      updateProduct: jest.fn(),
      verifyProductId: jest.fn().mockReturnValue(of(false)),
      getProducts: jest.fn().mockReturnValue(of([])),
      createProduct: jest.fn(),
      deleteProduct: jest.fn(),
      products$: of([]),
    } as any;

    const routerSpy = {
      navigate: jest.fn(),
    } as any;

    mockActivatedRoute = {
      snapshot: {
        params: {
          id: 'test-product-id',
        },
      },
    };

    await TestBed.configureTestingModule({
      declarations: [EditProductPageComponent, MockProductFormComponent],
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
      expect(component.productId).toBe('test-product-id');
      expect(component.isLoading).toBe(true);
      expect(component.errorMessage).toBe('');
    });

    it('debería obtener el ID del producto desde la ruta', () => {
      expect(component.productId).toBe('test-product-id');
    });
  });

  describe('Carga de producto', () => {
    it('debería cargar producto exitosamente', () => {
      mockProductService.getProductById.mockReturnValue(of(mockProduct));

      component.ngOnInit();

      expect(mockProductService.getProductById).toHaveBeenCalledWith(
        'test-product-id'
      );
      expect(component.product).toEqual(mockProduct);
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('debería limpiar estado de carga después de cargar producto', () => {
      mockProductService.getProductById.mockReturnValue(of(mockProduct));
      component.isLoading = true;

      component.ngOnInit();

      expect(component.isLoading).toBe(false);
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

    it('debería cargar producto al inicializar componente', () => {
      const loadProductSpy = jest.spyOn(component as any, 'loadProduct');
      mockProductService.getProductById.mockReturnValue(of(mockProduct));

      component.ngOnInit();

      expect(loadProductSpy).toHaveBeenCalled();
    });
  });

  describe('Manejo de producto no encontrado', () => {
    it('debería navegar a lista cuando producto no existe', () => {
      mockProductService.getProductById.mockReturnValue(of(undefined));

      component.ngOnInit();

      expect(component.errorMessage).toBe('Producto no encontrado');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
      expect(component.isLoading).toBe(false);
    });

    /* it('debería navegar a lista cuando producto es null', () => {
      mockProductService.getProductById.mockReturnValue(of(null));

      component.ngOnInit();

      expect(component.errorMessage).toBe('Producto no encontrado');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    }); */

    it('debería establecer mensaje de error cuando producto no encontrado', () => {
      mockProductService.getProductById.mockReturnValue(of(undefined));

      component.ngOnInit();

      expect(component.errorMessage).toBe('Producto no encontrado');
    });
  });

  describe('Actualización de producto', () => {
    beforeEach(() => {
      component.product = mockProduct;
      component.productId = 'test-product-id';
    });

    it('debería actualizar producto exitosamente', () => {
      mockProductService.updateProduct.mockReturnValue(of(mockUpdateData));

      component.onSave(mockUpdateData);

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        'test-product-id',
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

    it('debería navegar a lista después de actualización exitosa', () => {
      mockProductService.updateProduct.mockReturnValue(of(mockUpdateData));

      component.onSave(mockUpdateData);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('debería manejar error al actualizar producto', () => {
      const errorMessage = 'Error al actualizar producto';
      mockProductService.updateProduct.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      component.onSave(mockUpdateData);

      expect(component.errorMessage).toBe(errorMessage);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
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

  describe('Integración con ProductFormComponent', () => {
    beforeEach(() => {
      mockProductService.getProductById.mockReturnValue(of(mockProduct));
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('debería pasar isEditMode como true al ProductFormComponent', () => {
      const productFormDebugElement = fixture.debugElement.query(
        (debugEl) =>
          debugEl.componentInstance instanceof MockProductFormComponent
      );

      expect(productFormDebugElement).toBeTruthy();
      expect(productFormDebugElement.componentInstance.isEditMode).toBe(true);
    });

    it('debería pasar datos del producto como initialData', () => {
      const productFormDebugElement = fixture.debugElement.query(
        (debugEl) =>
          debugEl.componentInstance instanceof MockProductFormComponent
      );

      expect(productFormDebugElement.componentInstance.initialData).toEqual(
        mockProduct
      );
    });

    it('debería manejar evento save del ProductFormComponent', () => {
      const onSaveSpy = jest.spyOn(component, 'onSave');
      mockProductService.updateProduct.mockReturnValue(of(mockUpdateData));

      const productFormDebugElement = fixture.debugElement.query(
        (debugEl) =>
          debugEl.componentInstance instanceof MockProductFormComponent
      );

      productFormDebugElement.componentInstance.save.emit(mockUpdateData);

      expect(onSaveSpy).toHaveBeenCalledWith(mockUpdateData);
    });

    it('debería manejar evento cancel del ProductFormComponent', () => {
      const onCancelSpy = jest.spyOn(component, 'onCancel');

      const productFormDebugElement = fixture.debugElement.query(
        (debugEl) =>
          debugEl.componentInstance instanceof MockProductFormComponent
      );

      productFormDebugElement.componentInstance.cancel.emit();

      expect(onCancelSpy).toHaveBeenCalled();
    });
  });

  describe('Estados de la UI', () => {
    it('debería mostrar mensaje de error cuando existe', () => {
      component.errorMessage = 'Error de prueba';
      fixture.detectChanges();

      const errorElement =
        fixture.nativeElement.querySelector('.error-message');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent.trim()).toBe('Error de prueba');
    });

    it('no debería mostrar mensaje de error cuando está vacío', () => {
      component.errorMessage = '';
      fixture.detectChanges();

      const errorElement =
        fixture.nativeElement.querySelector('.error-message');
      expect(errorElement).toBeFalsy();
    });

    it('debería mostrar loading cuando isLoading es true', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const loadingElement = fixture.nativeElement.querySelector('.loading');
      expect(loadingElement).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('debería limpiar suscripciones al destruirse', () => {
      const destroyNextSpy = jest.spyOn(component['destroy$'], 'next');
      const destroyCompleteSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroyNextSpy).toHaveBeenCalled();
      expect(destroyCompleteSpy).toHaveBeenCalled();
    });
  });

  describe('Flujo completo', () => {
    it('debería completar flujo de edición exitosamente', () => {
      // Cargar producto
      mockProductService.getProductById.mockReturnValue(of(mockProduct));
      component.ngOnInit();

      expect(component.product).toEqual(mockProduct);
      expect(component.isLoading).toBe(false);

      // Actualizar producto
      mockProductService.updateProduct.mockReturnValue(of(mockUpdateData));
      component.onSave(mockUpdateData);

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        'test-product-id',
        mockUpdateData
      );
      expect(component.errorMessage).toBe('');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('debería manejar flujo cuando producto no existe', () => {
      mockProductService.getProductById.mockReturnValue(of(undefined));

      component.ngOnInit();

      expect(component.product).toBeNull();
      expect(component.errorMessage).toBe('Producto no encontrado');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('debería manejar flujo de error y permitir reintento', () => {
      // Cargar producto exitosamente
      mockProductService.getProductById.mockReturnValue(of(mockProduct));
      component.ngOnInit();

      // Primera actualización falla
      mockProductService.updateProduct.mockReturnValueOnce(
        throwError(() => new Error('Error temporal'))
      );

      component.onSave(mockUpdateData);
      expect(component.errorMessage).toBe('Error temporal');
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      // Segunda actualización exitosa
      mockProductService.updateProduct.mockReturnValueOnce(of(mockUpdateData));

      component.onSave(mockUpdateData);
      expect(component.errorMessage).toBe('');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });
  });

  describe('Validación de datos', () => {
    beforeEach(() => {
      component.productId = 'test-product-id';
    });

    it('debería aceptar datos de actualización válidos', () => {
      mockProductService.updateProduct.mockReturnValue(of(mockUpdateData));

      component.onSave(mockUpdateData);

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        'test-product-id',
        expect.objectContaining({
          name: mockUpdateData.name,
          description: mockUpdateData.description,
          logo: mockUpdateData.logo,
          date_release: mockUpdateData.date_release,
          date_revision: mockUpdateData.date_revision,
        })
      );
    });

    it('debería manejar datos con caracteres especiales', () => {
      const specialCharsData = {
        ...mockUpdateData,
        name: 'Producto actualizado con ñ y acentos',
        description:
          'Descripción actualizada con caracteres especiales: áéíóú & símbolos!',
      };
      mockProductService.updateProduct.mockReturnValue(of(specialCharsData));

      component.onSave(specialCharsData);

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        'test-product-id',
        specialCharsData
      );
    });
  });
});
