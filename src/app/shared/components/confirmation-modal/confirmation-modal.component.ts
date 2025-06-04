import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
  /**
   * Indica si el modal de confirmación es visible o no.
   */
  @Input() isVisible = false;
  /**
   * Mensaje que se mostrará en el modal de confirmación.
   * Este mensaje proporciona información o instrucciones al usuario antes de confirmar una acción.
   */
  @Input() message = '';

  /**
   * Evento emitido cuando el usuario confirma la acción en el modal de confirmación.
   *
   * Este evento no envía ningún valor (void) y puede ser escuchado por componentes padres
   * para ejecutar lógica adicional tras la confirmación del usuario.
   */
  @Output() confirm = new EventEmitter<void>();
  /**
   * Evento emitido cuando el usuario cancela la acción en el modal de confirmación.
   *
   * Este evento no envía ningún valor (void) y puede ser escuchado por componentes padres
   * para ejecutar lógica adicional tras la cancelación del usuario.
   */
  @Output() cancel = new EventEmitter<void>();

  /**
   * Emite el evento de confirmación cuando el usuario confirma la acción en el modal.
   *
   * Este método debe ser llamado cuando el usuario hace clic en el botón de confirmar.
   * Notifica a los componentes padres que la acción ha sido confirmada.
   */
  onConfirm(): void {
    this.confirm.emit();
  }

  /**
   * Emite el evento de cancelación cuando el usuario cancela la acción en el modal.
   *
   * Este método debe ser llamado cuando el usuario hace clic en el botón de cancelar.
   * Notifica a los componentes padres que la acción ha sido cancelada.
   */
  onCancel(): void {
    this.cancel.emit();
  }
}
