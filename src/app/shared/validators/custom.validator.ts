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
  /**
   * Validador personalizado que verifica si la fecha ingresada es igual o posterior a la fecha actual.
   *
   * @param control Control de formulario que contiene el valor de la fecha a validar.
   * @returns Un objeto de error con la clave `minDate` si la fecha es anterior a hoy, o `null` si es válida.
   */
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

  /**
   * Validador personalizado que verifica si la fecha de revisión es exactamente un año posterior a la fecha de lanzamiento.
   *
   * @param releaseDateControlName Nombre del control que contiene la fecha de lanzamiento.
   * @returns Un validador que valida el control de fecha de revisión.
   */
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

  /**
   * Validador asíncrono que verifica si un ID de producto es único.
   *
   * @param productService - Servicio utilizado para verificar la existencia del ID de producto.
   * @param isEdit - Indica si el formulario está en modo edición. Si es true y el valor no ha cambiado, no se valida.
   * @param originalId - El ID original del producto en caso de edición, para permitir que el usuario mantenga el mismo ID.
   * @returns Una función validadora asíncrona que retorna un observable con errores de validación o null si es válido.
   *
   * @remarks
   * - Si el valor es nulo, tiene menos de 3 caracteres, o es igual al original en modo edición, la validación se omite.
   * - Si el ID ya existe, retorna un error de validación con la clave `uniqueId`.
   * - Si ocurre un error en la verificación, se considera válido (retorna null).
   */
  static uniqueProductId(
    productService: ProductService,
    isEdit: boolean = false,
    originalId?: string
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (
        !control.value ||
        control.value.length < 3 ||
        (isEdit && control.value === originalId)
      ) {
        return of(null);
      }

      return of(control.value).pipe(
        debounceTime(500),
        switchMap((value) =>
          productService.verifyProductId(value).pipe(
            map((exists) => {
              return exists ? { uniqueId: { value } } : null;
            }),
            catchError(() => of(null))
          )
        )
      );
    };
  }

  /**
   * Valida si el valor del control es una URL válida.
   *
   * @param control - El control de formulario que contiene el valor a validar.
   * @returns Un objeto de error con la clave `invalidUrl` si la URL no es válida, o `null` si es válida o está vacío.
   */
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
