import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Subject } from 'rxjs'
import { Product } from 'src/app/core/models/product.model'
import { ProductService } from 'src/app/core/services/product.service'
import { CustomValidators } from 'src/app/shared/validators/custom.validator'

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit, OnDestroy {
  /**
   * Indica si el formulario está en modo edición.
   *
   * Cuando es `true`, el formulario permite editar un producto existente.
   * Cuando es `false`, el formulario se utiliza para crear un nuevo producto.
   */
  @Input() isEditMode = false;
  /**
   * Datos iniciales del producto a editar.
   *
   * Si se proporciona, el formulario se poblará con estos datos al inicializarse.
   * Si es `null`, el formulario estará vacío para crear un nuevo producto.
   */
  @Input() initialData: Product | null = null;

  /**
   * Evento emitido al guardar los datos del formulario.
   *
   * Contiene el objeto del producto con los datos ingresados.
   */
  @Output() save = new EventEmitter<any>();
  /**
   * Evento emitido al cancelar la operación del formulario.
   *
   * No contiene datos adicionales, simplemente indica que se ha cancelado.
   */
  @Output() cancel = new EventEmitter<void>();

  productForm: FormGroup;
  isSubmitting = false;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private productService: ProductService) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Maneja el cambio en la fecha de lanzamiento del producto.
   *
   * Cuando se modifica el campo 'date_release' en el formulario, este método calcula automáticamente
   * la fecha de revisión ('date_revision') sumando un año a la fecha de lanzamiento seleccionada.
   * Luego, actualiza el formulario con la nueva fecha de revisión en formato 'YYYY-MM-DD'.
   *
   * @returns {void} No retorna ningún valor.
   */
  onReleaseDateChange(): void {
    const releaseDateValue = this.productForm.get('date_release')?.value;

    if (releaseDateValue) {
      const releaseDate = new Date(releaseDateValue);
      const revisionDate = new Date(releaseDate);

      revisionDate.setFullYear(revisionDate.getFullYear() + 1);

      this.productForm.patchValue({
        date_revision: revisionDate.toISOString().split('T')[0],
      });
    }
  }

  /**
   * Maneja el evento de envío del formulario de producto.
   *
   * Si el formulario es válido y no se está enviando actualmente, emite los datos del producto
   * a través del evento `save`. Si está en modo edición (`isEditMode`), excluye el campo `id`
   * de los datos emitidos. Si no, emite todos los valores del formulario.
   *
   * Si el formulario no es válido, marca todos los campos como tocados para mostrar los errores.
   *
   * @returns {void}
   */
  onSubmit(): void {
    if (this.productForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.productForm.value;

      if (this.isEditMode) {
        const { id, ...productData } = formValue;
        this.save.emit(productData);
      } else {
        this.save.emit(formValue);
      }

      this.isSubmitting = false;
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Restablece el formulario de producto a su estado inicial.
   *
   * Si el formulario está en modo edición (`isEditMode`) y existen datos iniciales (`initialData`),
   * repuebla el formulario con dichos datos. De lo contrario, limpia todos los campos del formulario.
   *
   * Finalmente, marca todos los controles del formulario como no tocados.
   */
  onReset(): void {
    if (this.isEditMode && this.initialData) {
      this.populateForm(this.initialData);
    } else {
      this.productForm.reset();
    }

    this.markFormGroupUntouched();
  }

  /**
   * Emite un evento de cancelación.
   *
   * Este método se utiliza para notificar a los componentes padres que la acción actual ha sido cancelada,
   * emitiendo el evento `cancel`.
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Verifica si un campo específico del formulario es inválido.
   *
   * @param fieldName - El nombre del campo dentro del formulario a validar.
   * @returns `true` si el campo es inválido y ha sido modificado (`dirty`) o tocado (`touched`); de lo contrario, `false`.
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);

    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Crea y configura un formulario reactivo para el manejo de productos.
   *
   * El formulario incluye los siguientes campos:
   * - `id`: Identificador único del producto, requerido, con validaciones de longitud y validador asíncrono de unicidad si es modo creación.
   * - `name`: Nombre del producto, requerido, con validaciones de longitud.
   * - `description`: Descripción del producto, requerida, con validaciones de longitud.
   * - `logo`: URL del logo del producto, requerido y validado como URL.
   * - `date_release`: Fecha de lanzamiento, requerida y validada con una fecha mínima.
   * - `date_revision`: Fecha de revisión, requerida y validada en relación a la fecha de lanzamiento.
   *
   * Si el formulario está en modo creación (`!this.isEditMode`), se agrega un validador asíncrono para asegurar que el `id` sea único.
   *
   * @returns {FormGroup} Instancia del formulario configurado con sus validadores.
   */
  private createForm(): FormGroup {
    const form = this.fb.group({
      id: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      logo: ['', [Validators.required, CustomValidators.urlValidator]],
      date_release: ['', [Validators.required, CustomValidators.minDate]],
      date_revision: [
        '',
        [
          Validators.required,
          CustomValidators.dateRevisionValidator('date_release'),
        ],
      ],
    });

    if (!this.isEditMode) {
      const idControl = form.get('id');

      if (idControl) {
        idControl.setAsyncValidators([
          CustomValidators.uniqueProductId(this.productService, false),
        ]);

        idControl.updateValueAndValidity();
      }
    }

    return form;
  }

  /**
   * Rellena el formulario del producto con los datos proporcionados.
   *
   * @param product El objeto de tipo Product cuyos valores se utilizarán para completar el formulario.
   * @remarks
   * - Asigna los valores de las propiedades del producto a los campos correspondientes del formulario.
   * - Si el formulario está en modo edición (`isEditMode`), deshabilita el campo 'id' para evitar su modificación.
   */
  private populateForm(product: Product): void {
    this.productForm.patchValue({
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.date_release,
      date_revision: product.date_revision,
    });

    if (this.isEditMode) {
      this.productForm.get('id')?.disable();
    }
  }

  /**
   * Marca todos los controles del formulario `productForm` como tocados.
   *
   * Este método recorre cada uno de los controles del formulario y llama al método `markAsTouched()`
   * en cada uno de ellos. Esto es útil para forzar la visualización de mensajes de validación
   * en todos los campos del formulario, incluso si el usuario no ha interactuado con ellos.
   *
   * @private
   */
  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach((key) => {
      const control = this.productForm.get(key);

      control?.markAsTouched();
    });
  }

  /**
   * Marca todos los controles del formulario `productForm` como no tocados (untouched).
   *
   * Este método recorre cada uno de los controles del formulario y les quita el estado de "tocado",
   * lo cual puede ser útil para restablecer la apariencia de validación del formulario.
   *
   * @private
   */
  private markFormGroupUntouched(): void {
    Object.keys(this.productForm.controls).forEach((key) => {
      const control = this.productForm.get(key);

      control?.markAsUntouched();
    });
  }
}
