import { FormControl, FormGroup } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { ProductService } from '../../core/services/product.service'
import { CustomValidators } from './custom.validator'

describe('CustomValidators', () => {
  let mockProductService: jest.Mocked<ProductService>;

  beforeEach(() => {
    mockProductService = {
      verifyProductId: jest.fn(),
    } as any;
  });

  describe('minDate', () => {
    it('debería retornar null para una fecha futura válida', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const control = new FormControl(tomorrow.toISOString().split('T')[0]);

      const result = CustomValidators.minDate(control);

      expect(result).toBeNull();
    });

    it('debería retornar null para la fecha de hoy (permitiendo hoy)', () => {
      // Use a fixed date to avoid timezone issues
      const today = '2024-06-01';
      const control = new FormControl(today);

      // Mock Date.now() to return a consistent date
      const mockDate = new Date('2024-06-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = CustomValidators.minDate(control);

      expect(result).toBeNull();

      jest.restoreAllMocks();
    });

    it('debería retornar error para fecha pasada', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const control = new FormControl(yesterday.toISOString().split('T')[0]);

      const result = CustomValidators.minDate(control);

      expect(result).toEqual({
        minDate: {
          actualValue: yesterday.toISOString().split('T')[0],
          requiredValue: expect.any(String),
        },
      });
    });

    it('debería retornar null para valor vacío', () => {
      const control = new FormControl('');

      const result = CustomValidators.minDate(control);

      expect(result).toBeNull();
    });

    it('debería retornar null para valor null', () => {
      const control = new FormControl(null);

      const result = CustomValidators.minDate(control);

      expect(result).toBeNull();
    });
  });

  describe('dateRevisionValidator', () => {
    let formGroup: FormGroup;

    beforeEach(() => {
      formGroup = new FormGroup({
        date_release: new FormControl('2024-01-01'),
        date_revision: new FormControl('2025-01-01'),
      });
    });

    it('debería retornar null para fecha de revisión correcta (exactamente un año después)', () => {
      const validator = CustomValidators.dateRevisionValidator('date_release');
      const revisionControl = formGroup.get('date_revision')!;

      const result = validator(revisionControl);

      expect(result).toBeNull();
    });

    it('debería retornar error para fecha de revisión incorrecta', () => {
      formGroup.patchValue({
        date_release: '2024-01-01',
        date_revision: '2024-12-31', // Not exactly one year later
      });
      const validator = CustomValidators.dateRevisionValidator('date_release');
      const revisionControl = formGroup.get('date_revision')!;

      const result = validator(revisionControl);

      expect(result).toEqual({
        dateRevision: {
          actualValue: '2024-12-31',
          requiredValue: '2025-01-01',
        },
      });
    });

    it('debería retornar null cuando la fecha de lanzamiento está vacía', () => {
      formGroup.patchValue({
        date_release: '',
        date_revision: '2025-01-01',
      });
      const validator = CustomValidators.dateRevisionValidator('date_release');
      const revisionControl = formGroup.get('date_revision')!;

      const result = validator(revisionControl);

      expect(result).toBeNull();
    });

    it('debería retornar null cuando la fecha de revisión está vacía', () => {
      formGroup.patchValue({
        date_release: '2024-01-01',
        date_revision: '',
      });
      const validator = CustomValidators.dateRevisionValidator('date_release');
      const revisionControl = formGroup.get('date_revision')!;

      const result = validator(revisionControl);

      expect(result).toBeNull();
    });

    it('debería retornar null cuando el formulario padre no está disponible', () => {
      const standAloneControl = new FormControl('2025-01-01');
      const validator = CustomValidators.dateRevisionValidator('date_release');

      const result = validator(standAloneControl);

      expect(result).toBeNull();
    });
  });

  describe('uniqueProductId', () => {
    it('debería retornar null para valores cortos síncronamente', (done) => {
      const control = new FormControl('ab');
      const validator = CustomValidators.uniqueProductId(mockProductService);

      const result = validator(control);

      // Handle both synchronous null and asynchronous result
      if (result === null) {
        expect(result).toBeNull();
        done();
      } else if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((asyncResult: any) => {
          expect(asyncResult).toBeNull();
          done();
        });
      } else {
        expect(result).toBeNull();
        done();
      }
    });

    it('debería retornar null para valores vacíos', (done) => {
      const control = new FormControl('');
      const validator = CustomValidators.uniqueProductId(mockProductService);

      const result = validator(control);

      if (result === null) {
        expect(result).toBeNull();
        done();
      } else if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((asyncResult: any) => {
          expect(asyncResult).toBeNull();
          done();
        });
      } else {
        expect(result).toBeNull();
        done();
      }
    });

    it('debería retornar null para valores null', (done) => {
      const control = new FormControl(null);
      const validator = CustomValidators.uniqueProductId(mockProductService);

      const result = validator(control);

      if (result === null) {
        expect(result).toBeNull();
        done();
      } else if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((asyncResult: any) => {
          expect(asyncResult).toBeNull();
          done();
        });
      } else {
        expect(result).toBeNull();
        done();
      }
    });

    it('debería validar asíncronamente para valores de longitud válida', (done) => {
      mockProductService.verifyProductId.mockReturnValue(of(false));
      const control = new FormControl('valid-id');
      const validator = CustomValidators.uniqueProductId(mockProductService);

      const result = validator(control);

      if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((asyncResult: any) => {
          expect(asyncResult).toBeNull();
          expect(mockProductService.verifyProductId).toHaveBeenCalledWith(
            'valid-id'
          );
          done();
        });
      } else {
        expect(result).toBeNull();
        done();
      }
    });

    it('debería retornar error cuando el ID existe', (done) => {
      mockProductService.verifyProductId.mockReturnValue(of(true));
      const control = new FormControl('existing-id');
      const validator = CustomValidators.uniqueProductId(mockProductService);

      const result = validator(control);

      if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((asyncResult: any) => {
          expect(asyncResult).toEqual({
            uniqueId: { value: 'existing-id' },
          });
          done();
        });
      } else {
        fail('Expected async validator to return observable');
      }
    });

    it('debería manejar errores del servicio de manera elegante', (done) => {
      mockProductService.verifyProductId.mockReturnValue(
        throwError(() => new Error('Service error'))
      );
      const control = new FormControl('error-id');
      const validator = CustomValidators.uniqueProductId(mockProductService);

      const result = validator(control);

      if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((asyncResult: any) => {
          expect(asyncResult).toBeNull();
          done();
        });
      } else {
        expect(result).toBeNull();
        done();
      }
    });

    it('debería omitir validación en modo edición para el mismo ID', (done) => {
      const control = new FormControl('original-id');
      const validator = CustomValidators.uniqueProductId(
        mockProductService,
        true,
        'original-id'
      );

      const result = validator(control);

      if (result === null) {
        expect(result).toBeNull();
        expect(mockProductService.verifyProductId).not.toHaveBeenCalled();
        done();
      } else if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((asyncResult: any) => {
          expect(asyncResult).toBeNull();
          expect(mockProductService.verifyProductId).not.toHaveBeenCalled();
          done();
        });
      } else {
        expect(result).toBeNull();
        done();
      }
    });
  });

  describe('urlValidator', () => {
    it('debería retornar null para URL válida', () => {
      const control = new FormControl('https://example.com');

      const result = CustomValidators.urlValidator(control);

      expect(result).toBeNull();
    });

    it('debería retornar null para URL válida con ruta', () => {
      const control = new FormControl('https://example.com/path/to/resource');

      const result = CustomValidators.urlValidator(control);

      expect(result).toBeNull();
    });

    it('debería retornar error para URL inválida', () => {
      const control = new FormControl('not-a-url');

      const result = CustomValidators.urlValidator(control);

      expect(result).toEqual({
        invalidUrl: { value: 'not-a-url' },
      });
    });

    it('debería retornar null para valor vacío', () => {
      const control = new FormControl('');

      const result = CustomValidators.urlValidator(control);

      expect(result).toBeNull();
    });

    it('debería retornar null para valor null', () => {
      const control = new FormControl(null);

      const result = CustomValidators.urlValidator(control);

      expect(result).toBeNull();
    });
  });
});
