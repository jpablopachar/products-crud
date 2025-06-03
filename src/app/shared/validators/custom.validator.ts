// src/app/shared/validators/custom.validators.ts
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms'
import { Observable, of } from 'rxjs'
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators'
import { ProductService } from '../../core/services/product.service'

export class CustomValidators {
  // Validador para fecha mínima (fecha actual)
  static minDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      return {
        minDate: {
          actualValue: control.value,
          requiredValue: today.toISOString().split('T')[0],
        },
      };
    }

    return null;
  }

  // Validador para fecha de revisión (un año después de fecha de liberación)
  static dateRevisionValidator(releaseDateControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;

      const releaseDate = control.parent.get(releaseDateControlName)?.value;
      const revisionDate = control.value;

      if (!releaseDate || !revisionDate) return null;

      const release = new Date(releaseDate);
      const revision = new Date(revisionDate);
      const expectedRevision = new Date(release);
      expectedRevision.setFullYear(expectedRevision.getFullYear() + 1);

      if (revision.getTime() !== expectedRevision.getTime()) {
        return {
          dateRevision: {
            actualValue: revisionDate,
            requiredValue: expectedRevision.toISOString().split('T')[0],
          },
        };
      }

      return null;
    };
  }

  // Validador asíncrono para verificar ID único
  static uniqueProductId(
    productService: ProductService,
    isEdit: boolean = false,
    originalId?: string
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || (isEdit && control.value === originalId)) {
        return of(null);
      }

      return control.valueChanges.pipe(
        debounceTime(500),
        switchMap(() =>
          productService.verifyProductId(control.value).pipe(
            map((exists) =>
              exists ? { uniqueId: { value: control.value } } : null
            ),
            catchError(() => of(null))
          )
        )
      );
    };
  }

  // Validador para URL
  static urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: { value: control.value } };
    }
  }
}
