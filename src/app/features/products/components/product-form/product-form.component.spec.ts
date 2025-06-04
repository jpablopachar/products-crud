import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { of } from 'rxjs'
import { Product } from 'src/app/core/models/product.model'
import { ProductService } from 'src/app/core/services/product.service'
import { ProductFormComponent } from './product-form.component'

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let mockProductService: jest.Mocked<ProductService>;

  const mockProduct: Product = {
    id: 'test-id',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'https://example.com/logo.jpg',
    date_release: '2024-01-01',
    date_revision: '2025-01-01',
  };

  beforeEach(async () => {
    const spy = {
      verifyProductId: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [ProductFormComponent],
      imports: [ReactiveFormsModule],
      providers: [{ provide: ProductService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    mockProductService = TestBed.inject(
      ProductService
    ) as jest.Mocked<ProductService>;
    mockProductService.verifyProductId.mockReturnValue(of(false));
  });

  describe('Component Creation', () => {
    it('debería ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar el formulario con valores vacíos', () => {
      component.ngOnInit();

      expect(component.productForm.get('id')?.value).toBe('');
      expect(component.productForm.get('name')?.value).toBe('');
      expect(component.productForm.get('description')?.value).toBe('');
      expect(component.productForm.get('logo')?.value).toBe('');
      expect(component.productForm.get('date_release')?.value).toBe('');
      expect(component.productForm.get('date_revision')?.value).toBe('');
    });

    it('debería poblar el formulario con datos iniciales cuando se proporcionan', () => {
      component.initialData = mockProduct;
      component.ngOnInit();

      expect(component.productForm.get('id')?.value).toBe(mockProduct.id);
      expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
      expect(component.productForm.get('description')?.value).toBe(
        mockProduct.description
      );
      expect(component.productForm.get('logo')?.value).toBe(mockProduct.logo);
      expect(component.productForm.get('date_release')?.value).toBe(
        mockProduct.date_release
      );
      expect(component.productForm.get('date_revision')?.value).toBe(
        mockProduct.date_revision
      );
    });
  });

  describe('Edit Mode vs Create Mode', () => {
    it('debería deshabilitar el campo ID en modo edición', () => {
      component.isEditMode = true;
      component.initialData = mockProduct;
      component.ngOnInit();

      expect(component.productForm.get('id')?.disabled).toBe(true);
    });

    it('debería habilitar el campo ID en modo creación', () => {
      component.isEditMode = false;
      component.ngOnInit();

      expect(component.productForm.get('id')?.disabled).toBe(false);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('debería requerir todos los campos', () => {
      expect(component.productForm.get('id')?.hasError('required')).toBe(true);
      expect(component.productForm.get('name')?.hasError('required')).toBe(
        true
      );
      expect(
        component.productForm.get('description')?.hasError('required')
      ).toBe(true);
      expect(component.productForm.get('logo')?.hasError('required')).toBe(
        true
      );
      expect(
        component.productForm.get('date_release')?.hasError('required')
      ).toBe(true);
      expect(
        component.productForm.get('date_revision')?.hasError('required')
      ).toBe(true);
    });

    it('debería validar la longitud del ID', () => {
      const idControl = component.productForm.get('id')!;

      idControl.setValue('ab');
      expect(idControl.hasError('minlength')).toBe(true);

      idControl.setValue('12345678901');
      expect(idControl.hasError('maxlength')).toBe(true);

      idControl.setValue('abc123');
      expect(idControl.hasError('minlength')).toBe(false);
      expect(idControl.hasError('maxlength')).toBe(false);
    });

    it('debería validar la longitud del nombre', () => {
      const nameControl = component.productForm.get('name')!;

      nameControl.setValue('abcd');
      expect(nameControl.hasError('minlength')).toBe(true);

      nameControl.setValue('a'.repeat(101));
      expect(nameControl.hasError('maxlength')).toBe(true);

      nameControl.setValue('Valid Name');
      expect(nameControl.hasError('minlength')).toBe(false);
      expect(nameControl.hasError('maxlength')).toBe(false);
    });

    it('debería validar la longitud de la descripción', () => {
      const descControl = component.productForm.get('description')!;

      descControl.setValue('short');
      expect(descControl.hasError('minlength')).toBe(true);

      descControl.setValue('a'.repeat(201));
      expect(descControl.hasError('maxlength')).toBe(true);

      descControl.setValue('Valid description with enough characters');
      expect(descControl.hasError('minlength')).toBe(false);
      expect(descControl.hasError('maxlength')).toBe(false);
    });

    it('debería validar el formato de URL', () => {
      const logoControl = component.productForm.get('logo')!;

      logoControl.setValue('not-a-url');
      expect(logoControl.hasError('invalidUrl')).toBe(true);

      logoControl.setValue('https://example.com/logo.jpg');
      expect(logoControl.hasError('invalidUrl')).toBe(false);
    });
  });

  describe('Date Handling', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('debería establecer automáticamente la fecha de revisión cuando cambia la fecha de lanzamiento', () => {
      const releaseDateControl = component.productForm.get('date_release')!;
      const revisionDateControl = component.productForm.get('date_revision')!;

      releaseDateControl.setValue('2024-06-01');
      component.onReleaseDateChange();

      expect(revisionDateControl.value).toBe('2025-06-01');
    });

    it('no debería establecer la fecha de revisión cuando la fecha de lanzamiento está vacía', () => {
      const revisionDateControl = component.productForm.get('date_revision')!;

      component.productForm.get('date_release')!.setValue('');
      component.onReleaseDateChange();

      expect(revisionDateControl.value).toBe('');
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('no debería emitir evento de guardado cuando el formulario es inválido', () => {
      const saveSpy = jest.spyOn(component.save, 'emit');

      // Leave form empty (invalid)
      component.onSubmit();

      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('debería marcar todos los campos como tocados cuando el formulario es inválido', () => {
      component.onSubmit();

      expect(component.productForm.get('id')?.touched).toBe(true);
      expect(component.productForm.get('name')?.touched).toBe(true);
      expect(component.productForm.get('description')?.touched).toBe(true);
      expect(component.productForm.get('logo')?.touched).toBe(true);
      expect(component.productForm.get('date_release')?.touched).toBe(true);
      expect(component.productForm.get('date_revision')?.touched).toBe(true);
    });

    it('no debería enviar cuando ya se está enviando', () => {
      const saveSpy = jest.spyOn(component.save, 'emit');
      component.isSubmitting = true;

      component.onSubmit();

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('Form Reset', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('debería restablecer el formulario a valores vacíos en modo creación', () => {
      // Fill form first
      component.productForm.patchValue({
        id: 'test-123',
        name: 'Test Product',
        description: 'Test Description for product',
        logo: 'https://example.com/logo.jpg',
        date_release: '2024-06-01',
        date_revision: '2025-06-01',
      });

      component.onReset();

      expect(component.productForm.get('id')?.value).toBeNull();
      expect(component.productForm.get('name')?.value).toBeNull();
      expect(component.productForm.get('description')?.value).toBeNull();
      expect(component.productForm.get('logo')?.value).toBeNull();
      expect(component.productForm.get('date_release')?.value).toBeNull();
      expect(component.productForm.get('date_revision')?.value).toBeNull();
    });

    it('debería restablecer el formulario a datos iniciales en modo edición', () => {
      component.isEditMode = true;
      component.initialData = mockProduct;

      // Modify form values
      component.productForm.patchValue({
        name: 'Modified Name',
        description: 'Modified Description',
      });

      component.onReset();

      expect(component.productForm.get('id')?.value).toBe(mockProduct.id);
      expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
      expect(component.productForm.get('description')?.value).toBe(
        mockProduct.description
      );
    });

    it('debería marcar todos los campos como no tocados después del restablecimiento', () => {
      // Mark fields as touched first
      Object.keys(component.productForm.controls).forEach((key) => {
        component.productForm.get(key)?.markAsTouched();
      });

      component.onReset();

      expect(component.productForm.get('id')?.touched).toBe(false);
      expect(component.productForm.get('name')?.touched).toBe(false);
      expect(component.productForm.get('description')?.touched).toBe(false);
      expect(component.productForm.get('logo')?.touched).toBe(false);
      expect(component.productForm.get('date_release')?.touched).toBe(false);
      expect(component.productForm.get('date_revision')?.touched).toBe(false);
    });
  });

  describe('Event Emitters', () => {
    it('debería emitir evento de cancelación', () => {
      const cancelSpy = jest.spyOn(component.cancel, 'emit');

      component.onCancel();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('Field Validation Helper', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('debería retornar true para campo inválido tocado', () => {
      const nameControl = component.productForm.get('name')!;
      nameControl.markAsTouched();

      expect(component.isFieldInvalid('name')).toBe(true);
    });

    it('debería retornar true para campo inválido modificado', () => {
      const nameControl = component.productForm.get('name')!;
      nameControl.markAsDirty();

      expect(component.isFieldInvalid('name')).toBe(true);
    });

    it('debería retornar false para campo inválido no tocado', () => {
      expect(component.isFieldInvalid('name')).toBe(false);
    });

    it('debería retornar false para campo válido', () => {
      const nameControl = component.productForm.get('name')!;
      nameControl.setValue('Valid Name');
      nameControl.markAsTouched();

      expect(component.isFieldInvalid('name')).toBe(false);
    });

    it('debería retornar false para campo inexistente', () => {
      expect(component.isFieldInvalid('nonExistentField')).toBe(false);
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
  });
});
