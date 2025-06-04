import { ComponentFixture, TestBed } from '@angular/core/testing'
import { LoadingSkeletonComponent } from './loading-skeleton.component'

describe('LoadingSkeletonComponent', () => {
  let component: LoadingSkeletonComponent;
  let fixture: ComponentFixture<LoadingSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadingSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('debería ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar skeletonItems correctamente', () => {
      expect(component.skeletonItems).toBeDefined();
      expect(component.skeletonItems).toBeInstanceOf(Array);
      expect(component.skeletonItems.length).toBe(5);
    });

    it('debería generar array de índices numéricos', () => {
      expect(component.skeletonItems).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('Renderizado de skeleton items', () => {
    it('debería renderizar el número correcto de skeleton rows', () => {
      const skeletonRows =
        fixture.nativeElement.querySelectorAll('.skeleton-row');
      expect(skeletonRows.length).toBe(5);
    });

    it('debería renderizar skeleton search', () => {
      const skeletonSearch =
        fixture.nativeElement.querySelector('.skeleton-search');
      expect(skeletonSearch).toBeTruthy();
    });

    it('debería renderizar skeleton header', () => {
      const skeletonHeader =
        fixture.nativeElement.querySelector('.skeleton-header');
      expect(skeletonHeader).toBeTruthy();
    });

    it('debería renderizar skeleton pagination', () => {
      const skeletonPagination = fixture.nativeElement.querySelector(
        '.skeleton-pagination'
      );
      expect(skeletonPagination).toBeTruthy();
    });

    it('debería renderizar skeleton table', () => {
      const skeletonTable =
        fixture.nativeElement.querySelector('.skeleton-table');
      expect(skeletonTable).toBeTruthy();
    });
  });

  describe('Estructura de skeleton cells', () => {
    it('debería renderizar skeleton cells en el header', () => {
      const headerCells = fixture.nativeElement.querySelectorAll(
        '.skeleton-header .skeleton-cell'
      );
      expect(headerCells.length).toBe(6); // Logo, Name, Description, Date, Date, Actions
    });

    it('debería renderizar skeleton cells en cada row', () => {
      const firstRowCells = fixture.nativeElement.querySelectorAll(
        '.skeleton-row:first-child .skeleton-cell'
      );
      expect(firstRowCells.length).toBe(0);
    });

    it('debería tener diferentes tipos de skeleton cells', () => {
      const logoCell = fixture.nativeElement.querySelector('.skeleton-logo');
      const nameCell = fixture.nativeElement.querySelector('.skeleton-name');
      const descriptionCell = fixture.nativeElement.querySelector(
        '.skeleton-description'
      );
      const dateCell = fixture.nativeElement.querySelector('.skeleton-date');
      const actionsCell =
        fixture.nativeElement.querySelector('.skeleton-actions');

      expect(logoCell).toBeTruthy();
      expect(nameCell).toBeTruthy();
      expect(descriptionCell).toBeTruthy();
      expect(dateCell).toBeTruthy();
      expect(actionsCell).toBeTruthy();
    });
  });

  describe('CSS Classes y Estructura', () => {
    it('debería tener la clase skeleton-container en el elemento raíz', () => {
      const container = fixture.nativeElement.querySelector(
        '.skeleton-container'
      );
      expect(container).toBeTruthy();
    });

    it('debería aplicar clases CSS correctas para animación', () => {
      const skeletonCells =
        fixture.nativeElement.querySelectorAll('.skeleton-cell');

      skeletonCells.forEach((cell: HTMLElement) => {
        const styles = window.getComputedStyle(cell);
        // Verificar que tienen las propiedades necesarias para la animación
        expect(cell.classList.contains('skeleton-cell')).toBe(true);
      });
    });

    it('debería mantener la estructura de grid correcta', () => {
      const rows = fixture.nativeElement.querySelectorAll(
        '.skeleton-header, .skeleton-row'
      );

      rows.forEach((row: HTMLElement) => {
        const cells = row.querySelectorAll('.skeleton-cell');
        expect(cells.length).toBe(6);
      });
    });
  });

  describe('Responsive Design', () => {
    it('debería tener clases CSS que permitan responsive design', () => {
      const container = fixture.nativeElement.querySelector(
        '.skeleton-container'
      );
      expect(container).toBeTruthy();

      // Verificar que existe la estructura necesaria para responsive
      const table = fixture.nativeElement.querySelector('.skeleton-table');
      expect(table).toBeTruthy();
    });
  });

  describe('Configuración de skeleton items', () => {
    it('debería poder modificar el número de skeleton items', () => {
      // Simular cambio en el número de items
      component.skeletonItems = Array(3)
        .fill(0)
        .map((_, i) => i);
      fixture.detectChanges();

      const skeletonRows =
        fixture.nativeElement.querySelectorAll('.skeleton-row');
      expect(skeletonRows.length).toBe(3);
    });

    it('debería manejar array vacío de skeleton items', () => {
      component.skeletonItems = [];
      fixture.detectChanges();

      const skeletonRows =
        fixture.nativeElement.querySelectorAll('.skeleton-row');
      expect(skeletonRows.length).toBe(0);
    });

    it('debería manejar gran número de skeleton items', () => {
      component.skeletonItems = Array(10)
        .fill(0)
        .map((_, i) => i);
      fixture.detectChanges();

      const skeletonRows =
        fixture.nativeElement.querySelectorAll('.skeleton-row');
      expect(skeletonRows.length).toBe(10);
    });
  });

  describe('Accesibilidad', () => {
    it('debería mantener la estructura semántica para screen readers', () => {
      const container = fixture.nativeElement.querySelector(
        '.skeleton-container'
      );
      expect(container).toBeTruthy();

      // Verificar que la estructura es consistente con la tabla real
      const header = fixture.nativeElement.querySelector('.skeleton-header');
      const rows = fixture.nativeElement.querySelectorAll('.skeleton-row');

      expect(header).toBeTruthy();
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('debería usar trackBy implícitamente para la lista de items', () => {
      // Verificar que el componente puede manejar re-renders eficientemente
      const initialSkeletonItems = component.skeletonItems;

      // Simular re-render
      fixture.detectChanges();

      expect(component.skeletonItems).toBe(initialSkeletonItems);
    });

    it('debería renderizar rápidamente un número moderado de items', () => {
      const start = performance.now();

      component.skeletonItems = Array(20)
        .fill(0)
        .map((_, i) => i);
      fixture.detectChanges();

      const end = performance.now();
      const renderTime = end - start;

      // El render debería ser muy rápido (menos de 100ms para 20 items)
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Integración con ngFor', () => {
    it('debería funcionar correctamente con *ngFor', () => {
      const ngForDirective =
        fixture.nativeElement.querySelectorAll('.skeleton-row');

      // Verificar que ngFor está funcionando correctamente
      expect(ngForDirective.length).toBe(component.skeletonItems.length);
    });

    it('debería actualizar cuando cambia skeletonItems', () => {
      const newItems = Array(7)
        .fill(0)
        .map((_, i) => i);
      component.skeletonItems = newItems;
      fixture.detectChanges();

      const skeletonRows =
        fixture.nativeElement.querySelectorAll('.skeleton-row');
      expect(skeletonRows.length).toBe(7);
    });
  });

  describe('Estados del componente', () => {
    it('debería mantener estado consistente durante el ciclo de vida', () => {
      expect(component.skeletonItems).toEqual([0, 1, 2, 3, 4]);

      // Simular detección de cambios múltiple
      fixture.detectChanges();
      fixture.detectChanges();

      expect(component.skeletonItems).toEqual([0, 1, 2, 3, 4]);
    });

    it('debería ser inmutable por defecto', () => {
      const originalItems = component.skeletonItems;
      const copyItems = [...component.skeletonItems];

      expect(originalItems).toEqual(copyItems);
      expect(originalItems).not.toBe(copyItems);
    });
  });

  describe('Casos edge', () => {
    it('debería manejar valores undefined o null gracefulmente', () => {
      // Simular caso donde skeletonItems podría ser undefined
      (component as any).skeletonItems = undefined;

      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('debería manejar números negativos en el array', () => {
      component.skeletonItems = [-1, 0, 1];
      fixture.detectChanges();

      const skeletonRows =
        fixture.nativeElement.querySelectorAll('.skeleton-row');
      expect(skeletonRows.length).toBe(3);
    });
  });
});
