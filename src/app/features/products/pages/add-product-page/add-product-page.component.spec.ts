import { Component, EventEmitter, Input, Output } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { Product } from 'src/app/core/models/product.model'
import { ProductService } from 'src/app/core/services/product.service'
import { AddProductPageComponent } from './add-product-page.component'

// Stub component para evitar problemas con ProductFormComponent
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

describe('AddProductPageComponent', () => {
  let component: AddProductPageComponent;
  let fixture: ComponentFixture<AddProductPageComponent>;
  let mockProductService: jest.Mocked<ProductService>;
  let mockRouter: jest.Mocked<Router>;

  const mockProductData = {
    id: 'new-product-id',
    name: 'New Product',
    description: 'New Product Description for testing',
    logo: 'https://example.com/logo.jpg',
    date_release: '2024-06-01',
    date_revision: '2025-06-01',
  };

  const mockCreatedProduct: Product = {
    ...mockProductData,
  };

  beforeEach(async () => {
    const productServiceSpy = {
      createProduct: jest.fn(),
      verifyProductId: jest.fn().mockReturnValue(of(false)),
      getProducts: jest.fn().mockReturnValue(of([])),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      getProductById: jest.fn().mockReturnValue(of(undefined)),
      products$: of([]),
    } as any;

    const routerSpy = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [
        AddProductPageComponent,
        MockProductFormComponent, // Usar el mock component en lugar del real
      ],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddProductPageComponent);
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

    it('debería inicializar con errorMessage vacío', () => {
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Guardado de producto', () => {
    it('debería guardar producto exitosamente', () => {
      mockProductService.createProduct.mockReturnValue(of(mockCreatedProduct));

      component.onSave(mockProductData);

      expect(mockProductService.createProduct).toHaveBeenCalledWith(
        mockProductData
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
      expect(component.errorMessage).toBe('');
    });

    it('debería limpiar mensaje de error antes de guardar', () => {
      component.errorMessage = 'Error previo';
      mockProductService.createProduct.mockReturnValue(of(mockCreatedProduct));

      component.onSave(mockProductData);

      expect(component.errorMessage).toBe('');
    });

    it('debería navegar a lista de productos después del guardado exitoso', () => {
      mockProductService.createProduct.mockReturnValue(of(mockCreatedProduct));

      component.onSave(mockProductData);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });
  });

  describe('Manejo de errores', () => {
    it('debería mostrar mensaje de error cuando falla la creación', () => {
      const errorMessage = 'Error al crear producto';
      mockProductService.createProduct.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      component.onSave(mockProductData);

      expect(component.errorMessage).toBe(errorMessage);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('debería manejar errores de validación del servidor', () => {
      const validationError = 'ID ya existe';
      mockProductService.createProduct.mockReturnValue(
        throwError(() => new Error(validationError))
      );

      component.onSave(mockProductData);

      expect(component.errorMessage).toBe(validationError);
    });

    it('debería manejar errores de red', () => {
      const networkError = 'No se puede conectar con el servidor';
      mockProductService.createProduct.mockReturnValue(
        throwError(() => new Error(networkError))
      );

      component.onSave(mockProductData);

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
    it('debería pasar isEditMode como false al ProductFormComponent', () => {
      fixture.detectChanges();

      const productFormDebugElement = fixture.debugElement.query(
        (debugEl) =>
          debugEl.componentInstance instanceof MockProductFormComponent
      );

      expect(productFormDebugElement).toBeTruthy();
      expect(productFormDebugElement.componentInstance.isEditMode).toBe(false);
    });

    it('debería manejar evento cancel del ProductFormComponent', () => {
      const onCancelSpy = jest.spyOn(component, 'onCancel');
      fixture.detectChanges();

      const productFormDebugElement = fixture.debugElement.query(
        (debugEl) =>
          debugEl.componentInstance instanceof MockProductFormComponent
      );

      productFormDebugElement.componentInstance.cancel.emit();

      expect(onCancelSpy).toHaveBeenCalled();
    });
  });

  describe('Validación de datos', () => {
    it('debería aceptar datos de producto válidos', () => {
      mockProductService.createProduct.mockReturnValue(of(mockCreatedProduct));

      component.onSave(mockProductData);

      expect(mockProductService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockProductData.id,
          name: mockProductData.name,
          description: mockProductData.description,
          logo: mockProductData.logo,
          date_release: mockProductData.date_release,
          date_revision: mockProductData.date_revision,
        })
      );
    });

    it('debería manejar datos con caracteres especiales', () => {
      const specialCharsData = {
        ...mockProductData,
        name: 'Producto con ñ y acentos',
        description: 'Descripción con caracteres especiales: áéíóú & símbolos!',
      };
      mockProductService.createProduct.mockReturnValue(of(mockCreatedProduct));

      component.onSave(specialCharsData);

      expect(mockProductService.createProduct).toHaveBeenCalledWith(
        specialCharsData
      );
    });
  });

  describe('Estados de la UI', () => {
    it('debería mostrar mensaje de error en el template cuando existe', () => {
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
  });

  describe('Flujo completo', () => {
    it('debería completar el flujo de creación de producto exitosamente', async () => {
      mockProductService.createProduct.mockReturnValue(of(mockCreatedProduct));

      // Simular que el usuario llena el formulario y hace submit
      component.onSave(mockProductData);

      // Verificar que se llamó al servicio
      expect(mockProductService.createProduct).toHaveBeenCalledWith(
        mockProductData
      );

      // Verificar que no hay errores
      expect(component.errorMessage).toBe('');

      // Verificar navegación
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('debería manejar flujo de error y permitir reintento', () => {
      // Primera llamada falla
      mockProductService.createProduct.mockReturnValueOnce(
        throwError(() => new Error('Error temporal'))
      );

      component.onSave(mockProductData);
      expect(component.errorMessage).toBe('Error temporal');
      expect(mockRouter.navigate).not.toHaveBeenCalled();

      // Segunda llamada exitosa
      mockProductService.createProduct.mockReturnValueOnce(
        of(mockCreatedProduct)
      );

      component.onSave(mockProductData);
      expect(component.errorMessage).toBe('');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });
  });
});
