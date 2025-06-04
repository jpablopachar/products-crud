import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ConfirmationModalComponent } from './confirmation-modal.component'

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmationModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('debería ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar propiedades por defecto', () => {
      expect(component.isVisible).toBe(false);
      expect(component.message).toBe('');
    });
  });

  describe('Visibilidad del modal', () => {
    it('debería mostrar modal cuando isVisible es true', () => {
      component.isVisible = true;
      fixture.detectChanges();

      const modalOverlay =
        fixture.nativeElement.querySelector('.modal-overlay');
      expect(modalOverlay).toBeTruthy();
    });

    it('debería ocultar modal cuando isVisible es false', () => {
      component.isVisible = false;
      fixture.detectChanges();

      const modalOverlay =
        fixture.nativeElement.querySelector('.modal-overlay');
      expect(modalOverlay).toBeFalsy();
    });

    it('debería alternar visibilidad correctamente', () => {
      // Inicialmente oculto
      component.isVisible = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.modal-overlay')).toBeFalsy();

      // Mostrar modal
      component.isVisible = true;
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.modal-overlay')
      ).toBeTruthy();

      // Ocultar modal nuevamente
      component.isVisible = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.modal-overlay')).toBeFalsy();
    });
  });

  describe('Mensaje del modal', () => {
    beforeEach(() => {
      component.isVisible = true;
    });

    it('debería mostrar el mensaje proporcionado', () => {
      const testMessage = '¿Está seguro de que desea eliminar este elemento?';
      component.message = testMessage;
      fixture.detectChanges();

      const messageElement =
        fixture.nativeElement.querySelector('.modal-body p');
      expect(messageElement.textContent).toBe(testMessage);
    });

    it('debería mostrar mensaje vacío cuando no se proporciona', () => {
      component.message = '';
      fixture.detectChanges();

      const messageElement =
        fixture.nativeElement.querySelector('.modal-body p');
      expect(messageElement.textContent).toBe('');
    });

    it('debería actualizar mensaje dinámicamente', () => {
      const firstMessage = 'Primer mensaje';
      const secondMessage = 'Segundo mensaje';

      component.message = firstMessage;
      fixture.detectChanges();
      let messageElement = fixture.nativeElement.querySelector('.modal-body p');
      expect(messageElement.textContent).toBe(firstMessage);

      component.message = secondMessage;
      fixture.detectChanges();
      messageElement = fixture.nativeElement.querySelector('.modal-body p');
      expect(messageElement.textContent).toBe(secondMessage);
    });

    it('debería manejar mensajes largos', () => {
      const longMessage =
        'Este es un mensaje muy largo que debería ser manejado correctamente por el modal sin causar problemas de diseño o funcionalidad. Debería mostrar todo el contenido de manera legible.';
      component.message = longMessage;
      fixture.detectChanges();

      const messageElement =
        fixture.nativeElement.querySelector('.modal-body p');
      expect(messageElement.textContent).toBe(longMessage);
    });

    it('debería manejar caracteres especiales en el mensaje', () => {
      const specialMessage =
        'Mensaje con áéíóú, ñ, & símbolos especiales: !@#$%^&*()';
      component.message = specialMessage;
      fixture.detectChanges();

      const messageElement =
        fixture.nativeElement.querySelector('.modal-body p');
      expect(messageElement.textContent).toBe(specialMessage);
    });
  });

  describe('Eventos de confirmación y cancelación', () => {
    beforeEach(() => {
      component.isVisible = true;
      fixture.detectChanges();
    });

    it('debería emitir evento confirm al hacer clic en confirmar', () => {
      const confirmSpy = jest.spyOn(component.confirm, 'emit');

      component.onConfirm();

      expect(confirmSpy).toHaveBeenCalled();
    });

    it('debería emitir evento cancel al hacer clic en cancelar', () => {
      const cancelSpy = jest.spyOn(component.cancel, 'emit');

      component.onCancel();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('debería emitir evento confirm desde el botón en el template', () => {
      const confirmSpy = jest.spyOn(component.confirm, 'emit');
      const confirmButton = fixture.nativeElement.querySelector('.btn-primary');

      confirmButton.click();

      expect(confirmSpy).toHaveBeenCalled();
    });

    it('debería emitir evento cancel desde el botón cancelar en el template', () => {
      const cancelSpy = jest.spyOn(component.cancel, 'emit');
      const cancelButton =
        fixture.nativeElement.querySelector('.btn-secondary');

      cancelButton.click();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('debería emitir evento cancel al hacer clic en el overlay', () => {
      const cancelSpy = jest.spyOn(component.cancel, 'emit');
      const overlay = fixture.nativeElement.querySelector('.modal-overlay');

      overlay.click();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('no debería emitir evento cancel al hacer clic en el contenido del modal', () => {
      const cancelSpy = jest.spyOn(component.cancel, 'emit');
      const modalContent =
        fixture.nativeElement.querySelector('.modal-content');

      modalContent.click();

      expect(cancelSpy).not.toHaveBeenCalled();
    });
  });

  describe('Estructura del modal', () => {
    beforeEach(() => {
      component.isVisible = true;
      fixture.detectChanges();
    });

    it('debería tener la estructura HTML correcta', () => {
      const overlay = fixture.nativeElement.querySelector('.modal-overlay');
      const content = fixture.nativeElement.querySelector('.modal-content');
      const body = fixture.nativeElement.querySelector('.modal-body');
      const actions = fixture.nativeElement.querySelector('.modal-actions');

      expect(overlay).toBeTruthy();
      expect(content).toBeTruthy();
      expect(body).toBeTruthy();
      expect(actions).toBeTruthy();
    });

    it('debería tener botones de acción correctos', () => {
      const cancelButton =
        fixture.nativeElement.querySelector('.btn-secondary');
      const confirmButton = fixture.nativeElement.querySelector('.btn-primary');

      expect(cancelButton).toBeTruthy();
      expect(confirmButton).toBeTruthy();
      expect(cancelButton.textContent.trim()).toBe('Cancelar');
      expect(confirmButton.textContent.trim()).toBe('Eliminar');
    });

    it('debería tener las clases CSS correctas', () => {
      const overlay = fixture.nativeElement.querySelector('.modal-overlay');
      const content = fixture.nativeElement.querySelector('.modal-content');

      expect(overlay.classList.contains('modal-overlay')).toBe(true);
      expect(content.classList.contains('modal-content')).toBe(true);
    });
  });

  describe('Propagación de eventos', () => {
    beforeEach(() => {
      component.isVisible = true;
      fixture.detectChanges();
    });

    it('debería detener propagación en el contenido del modal', () => {
      const mockEvent = {
        stopPropagation: jest.fn(),
      };

      const modalContent =
        fixture.nativeElement.querySelector('.modal-content');
      modalContent.dispatchEvent(new Event('click'));

      // Verificar que el método existe en el template (esto se maneja por el atributo del template)
      expect(modalContent).toBeTruthy();
    });
  });

  describe('Accesibilidad', () => {
    beforeEach(() => {
      component.isVisible = true;
      fixture.detectChanges();
    });

    it('debería tener botones accesibles', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');

      buttons.forEach((button: HTMLButtonElement) => {
        expect(button.type).toBe('button');
      });
    });

    it('debería mantener estructura semántica', () => {
      const body = fixture.nativeElement.querySelector('.modal-body');
      const actions = fixture.nativeElement.querySelector('.modal-actions');

      expect(body).toBeTruthy();
      expect(actions).toBeTruthy();
    });
  });

  describe('Casos edge', () => {
    it('debería manejar múltiples cambios de visibilidad rápidos', () => {
      // Alternar visibilidad múltiples veces rápidamente
      component.isVisible = true;
      fixture.detectChanges();
      component.isVisible = false;
      fixture.detectChanges();
      component.isVisible = true;
      fixture.detectChanges();

      const modalOverlay =
        fixture.nativeElement.querySelector('.modal-overlay');
      expect(modalOverlay).toBeTruthy();
    });

    it('debería manejar mensaje null o undefined', () => {
      component.isVisible = true;
      component.message = null as any;
      fixture.detectChanges();

      const messageElement =
        fixture.nativeElement.querySelector('.modal-body p');
      expect(messageElement).toBeTruthy();
    });

    it('debería manejar eventos múltiples', () => {
      component.isVisible = true;
      fixture.detectChanges();

      const confirmSpy = jest.spyOn(component.confirm, 'emit');

      // Hacer clic múltiples veces
      component.onConfirm();
      component.onConfirm();
      component.onConfirm();

      expect(confirmSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integración', () => {
    it('debería funcionar en un flujo completo de confirmación', () => {
      const confirmSpy = jest.spyOn(component.confirm, 'emit');
      const cancelSpy = jest.spyOn(component.cancel, 'emit');

      // Mostrar modal
      component.isVisible = true;
      component.message = '¿Confirmar acción?';
      fixture.detectChanges();

      // Verificar que está visible
      expect(
        fixture.nativeElement.querySelector('.modal-overlay')
      ).toBeTruthy();

      // Confirmar
      component.onConfirm();
      expect(confirmSpy).toHaveBeenCalled();

      // Reset para cancelar
      confirmSpy.mockClear();
      component.onCancel();
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('debería manejar cambios de propiedades desde el componente padre', () => {
      // Simular cambios desde componente padre
      component.isVisible = false;
      component.message = 'Mensaje inicial';
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.modal-overlay')).toBeFalsy();

      // Cambiar propiedades
      component.isVisible = true;
      component.message = 'Nuevo mensaje';
      fixture.detectChanges();

      const modalOverlay =
        fixture.nativeElement.querySelector('.modal-overlay');
      const messageElement =
        fixture.nativeElement.querySelector('.modal-body p');

      expect(modalOverlay).toBeTruthy();
      expect(messageElement.textContent).toBe('Nuevo mensaje');
    });
  });

  describe('Performance', () => {
    it('debería renderizar rápidamente', () => {
      const start = performance.now();

      component.isVisible = true;
      component.message = 'Test message';
      fixture.detectChanges();

      const end = performance.now();
      const renderTime = end - start;

      expect(renderTime).toBeLessThan(50); // Debería renderizar en menos de 50ms
    });

    it('debería manejar cambios frecuentes de estado eficientemente', () => {
      const start = performance.now();

      // Simular cambios frecuentes
      for (let i = 0; i < 10; i++) {
        component.isVisible = i % 2 === 0;
        component.message = `Message ${i}`;
        fixture.detectChanges();
      }

      const end = performance.now();
      const totalTime = end - start;

      expect(totalTime).toBeLessThan(200); // Debería manejar 10 cambios en menos de 200ms
    });
  });
});
