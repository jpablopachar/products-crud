import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { Product } from 'src/app/core/models/product.model'
import { ProductListComponent } from './product-list.component'

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  const mockProducts: Product[] = [
    {
      id: 'test-1',
      name: 'Test Product 1',
      description: 'Test Description 1',
      logo: 'https://example.com/logo1.jpg',
      date_release: '2024-01-01',
      date_revision: '2025-01-01',
    },
    {
      id: 'test-2',
      name: 'Test Product 2',
      description: 'Test Description 2',
      logo: 'https://example.com/logo2.jpg',
      date_release: '2024-02-01',
      date_revision: '2025-02-01',
    },
    {
      id: 'test-3',
      name: 'Test Product 3',
      description: 'Test Description 3',
      logo: 'https://example.com/logo3.jpg',
      date_release: '2024-03-01',
      date_revision: '2025-03-01',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductListComponent],
      imports: [FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('debería ser creado', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar propiedades por defecto', () => {
      expect(component.products).toEqual([]);
      expect(component.itemsPerPage).toBe(5);
      expect(component.paginatedProducts).toEqual([]);
      expect(component.totalResults).toBe(0);
      expect(component.openDropdownId).toBeNull();
    });
  });

  describe('Paginación', () => {
    beforeEach(() => {
      component.products = mockProducts;
    });

    it('debería mostrar solo los primeros elementos según itemsPerPage', () => {
      component.itemsPerPage = 2;
      component.ngOnChanges({
        products: {
          currentValue: mockProducts,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
        itemsPerPage: {
          currentValue: 2,
          previousValue: 5,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.paginatedProducts.length).toBe(2);
      expect(component.paginatedProducts).toEqual([
        mockProducts[0],
        mockProducts[1],
      ]);
    });

    it('debería mostrar todos los productos si itemsPerPage es mayor que el total', () => {
      component.itemsPerPage = 10;
      component.ngOnChanges({
        products: {
          currentValue: mockProducts,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
        itemsPerPage: {
          currentValue: 10,
          previousValue: 5,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.paginatedProducts.length).toBe(3);
      expect(component.paginatedProducts).toEqual(mockProducts);
    });

    it('debería actualizar totalResults correctamente', () => {
      component.ngOnChanges({
        products: {
          currentValue: mockProducts,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(component.totalResults).toBe(3);
    });

    it('debería actualizar paginación cuando cambia itemsPerPage', () => {
      component.products = mockProducts;
      component.itemsPerPage = 1;

      component.onItemsPerPageChange();

      expect(component.paginatedProducts.length).toBe(1);
      expect(component.paginatedProducts[0]).toBe(mockProducts[0]);
    });

    it('debería emitir evento cuando cambia itemsPerPage', () => {
      const emitSpy = jest.spyOn(component.itemsPerPageChange, 'emit');
      component.itemsPerPage = 10;

      component.onItemsPerPageChange();

      expect(emitSpy).toHaveBeenCalledWith(10);
    });
  });

  describe('Dropdown de acciones', () => {
    beforeEach(() => {
      component.products = mockProducts;
      fixture.detectChanges();
    });

    it('debería alternar dropdown correctamente', () => {
      const productId = 'test-1';

      // Abrir dropdown
      component.toggleDropdown(productId);
      expect(component.openDropdownId).toBe(productId);

      // Cerrar dropdown
      component.toggleDropdown(productId);
      expect(component.openDropdownId).toBeNull();
    });

    it('debería cerrar dropdown anterior al abrir uno nuevo', () => {
      component.toggleDropdown('test-1');
      expect(component.openDropdownId).toBe('test-1');

      component.toggleDropdown('test-2');
      expect(component.openDropdownId).toBe('test-2');
    });

    it('debería detener propagación del evento', () => {
      const mockEvent = {
        stopPropagation: jest.fn(),
      } as any;

      component.toggleDropdown('test-1', mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('debería manejar toggleDropdown sin evento', () => {
      expect(() => {
        component.toggleDropdown('test-1');
      }).not.toThrow();

      expect(component.openDropdownId).toBe('test-1');
    });

    it('debería cerrar dropdown al hacer click en documento', () => {
      component.openDropdownId = 'test-1';

      component.onDocumentClick(new Event('click'));

      expect(component.openDropdownId).toBeNull();
    });
  });

  describe('Eventos de editar y eliminar', () => {
    beforeEach(() => {
      component.products = mockProducts;
      fixture.detectChanges();
    });

    it('debería emitir evento de edición', () => {
      const emitSpy = jest.spyOn(component.edit, 'emit');
      const product = mockProducts[0];

      component.onEdit(product);

      expect(emitSpy).toHaveBeenCalledWith(product);
      expect(component.openDropdownId).toBeNull();
    });

    it('debería emitir evento de eliminación', () => {
      const emitSpy = jest.spyOn(component.delete, 'emit');
      const product = mockProducts[0];

      component.onDelete(product);

      expect(emitSpy).toHaveBeenCalledWith(product);
      expect(component.openDropdownId).toBeNull();
    });

    it('debería cerrar dropdown al editar', () => {
      component.openDropdownId = 'test-1';

      component.onEdit(mockProducts[0]);

      expect(component.openDropdownId).toBeNull();
    });

    it('debería cerrar dropdown al eliminar', () => {
      component.openDropdownId = 'test-1';

      component.onDelete(mockProducts[0]);

      expect(component.openDropdownId).toBeNull();
    });
  });

  /* describe('Formato de fechas', () => {
    it('debería formatear fecha correctamente en formato español', () => {
      const dateString = '2024-01-14';
      const formattedDate = component.formatDate(dateString);

      expect(formattedDate).toBe('15/01/2024');
    });

    it('debería manejar diferentes formatos de fecha', () => {
      const testCases = [
        { input: '2024-12-25', expected: '25/12/2024' },
        { input: '2024-01-01', expected: '01/01/2024' },
        { input: '2024-06-15', expected: '15/06/2024' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(component.formatDate(input)).toBe(expected);
      });
    });

    it('debería manejar años diferentes', () => {
      const dateString = '2025-03-10';
      const formattedDate = component.formatDate(dateString);

      expect(formattedDate).toBe('10/03/2025');
    });
  }); */

  describe('TrackBy function', () => {
    it('debería retornar el ID del producto', () => {
      const product = mockProducts[0];
      const result = component.trackByProductId(0, product);

      expect(result).toBe(product.id);
    });

    it('debería funcionar con diferentes índices', () => {
      const product = mockProducts[1];
      const result = component.trackByProductId(5, product);

      expect(result).toBe(product.id);
    });

    it('debería manejar productos con IDs únicos', () => {
      mockProducts.forEach((product, index) => {
        const result = component.trackByProductId(index, product);
        expect(result).toBe(product.id);
      });
    });
  });

  /* describe('Manejo de errores de imagen', () => {
    it('debería establecer imagen por defecto cuando falla la carga', () => {
      const mockImg = {
        src: 'https://example.com/broken-image.jpg',
      } as HTMLImageElement;

      const mockEvent = {
        target: mockImg,
      } as Event;

      component.onImageError(mockEvent);

      expect(mockImg.src).toContain('data:image/svg+xml;base64,');
    });

    it('debería manejar evento con target correcto', () => {
      const mockImg = document.createElement('img');
      mockImg.src = 'https://example.com/broken-image.jpg';

      const mockEvent = {
        target: mockImg,
      } as Event;

      component.onImageError(mockEvent);

      expect(mockImg.src).toMatch(/^data:image\/svg\+xml;base64,/);
    });
  }); */

  describe('Lifecycle hooks', () => {
    it('debería llamar updatePaginatedProducts cuando cambian los productos', () => {
      const updateSpy = jest.spyOn(component, 'updatePaginatedProducts' as any);

      component.ngOnChanges({
        products: {
          currentValue: mockProducts,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(updateSpy).toHaveBeenCalled();
    });

    it('debería llamar updatePaginatedProducts cuando cambia itemsPerPage', () => {
      const updateSpy = jest.spyOn(component, 'updatePaginatedProducts' as any);

      component.ngOnChanges({
        itemsPerPage: {
          currentValue: 10,
          previousValue: 5,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(updateSpy).toHaveBeenCalled();
    });

    it('no debería llamar updatePaginatedProducts si no cambian productos ni itemsPerPage', () => {
      const updateSpy = jest.spyOn(component, 'updatePaginatedProducts' as any);

      component.ngOnChanges({
        otherProperty: {
          currentValue: 'new',
          previousValue: 'old',
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Renderizado de elementos', () => {
    beforeEach(() => {
      component.products = mockProducts;
      component.ngOnChanges({
        products: {
          currentValue: mockProducts,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      fixture.detectChanges();
    });

    it('debería renderizar el número correcto de filas de productos', () => {
      const productRows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(productRows.length).toBe(component.paginatedProducts.length);
    });

    it('debería mostrar información del producto en cada fila', () => {
      const firstRow = fixture.nativeElement.querySelector(
        'tbody tr:first-child'
      );
      const product = component.paginatedProducts[0];

      expect(firstRow.textContent).toContain(product.name);
      expect(firstRow.textContent).toContain(product.description);
    });

    it('debería renderizar imágenes de logos', () => {
      const logoImages =
        fixture.nativeElement.querySelectorAll('.product-logo');
      expect(logoImages.length).toBe(component.paginatedProducts.length);

      logoImages.forEach((img: HTMLImageElement, index: number) => {
        expect(img.src).toBe(component.paginatedProducts[index].logo);
        expect(img.alt).toBe(component.paginatedProducts[index].name);
      });
    });

    it('debería mostrar fechas formateadas', () => {
      const firstRow = fixture.nativeElement.querySelector(
        'tbody tr:first-child'
      );
      const product = component.paginatedProducts[0];

      const expectedReleaseDate = component.formatDate(product.date_release);
      const expectedRevisionDate = component.formatDate(product.date_revision);

      expect(firstRow.textContent).toContain(expectedReleaseDate);
      expect(firstRow.textContent).toContain(expectedRevisionDate);
    });

    it('debería renderizar botones de dropdown para cada producto', () => {
      const dropdownButtons =
        fixture.nativeElement.querySelectorAll('.dropdown-trigger');
      expect(dropdownButtons.length).toBe(component.paginatedProducts.length);
    });
  });

  describe('Interacciones de UI', () => {
    beforeEach(() => {
      component.products = mockProducts;
      component.ngOnChanges({
        products: {
          currentValue: mockProducts,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      fixture.detectChanges();
    });

    it('debería abrir dropdown al hacer click en el botón', () => {
      const firstDropdownButton =
        fixture.nativeElement.querySelector('.dropdown-trigger');
      const productId = component.paginatedProducts[0].id;

      firstDropdownButton.click();

      expect(component.openDropdownId).toBe(productId);
    });

    it('debería mostrar opciones de dropdown cuando está abierto', () => {
      const productId = component.paginatedProducts[0].id;
      component.openDropdownId = productId;
      fixture.detectChanges();

      const dropdownMenu =
        fixture.nativeElement.querySelector('.dropdown-menu');
      expect(dropdownMenu).toBeTruthy();

      const editButton = fixture.nativeElement.querySelector(
        '.dropdown-item:not(.delete)'
      );
      const deleteButton = fixture.nativeElement.querySelector(
        '.dropdown-item.delete'
      );

      expect(editButton).toBeTruthy();
      expect(deleteButton).toBeTruthy();
      expect(editButton.textContent.trim()).toBe('Editar');
      expect(deleteButton.textContent.trim()).toBe('Eliminar');
    });

    it('debería ocultar dropdown cuando no está abierto', () => {
      component.openDropdownId = null;
      fixture.detectChanges();

      const dropdownMenu =
        fixture.nativeElement.querySelector('.dropdown-menu');
      expect(dropdownMenu).toBeFalsy();
    });

    it('debería cambiar itemsPerPage con el select', () => {
      const select = fixture.nativeElement.querySelector(
        '.items-per-page-select'
      );
      const emitSpy = jest.spyOn(component.itemsPerPageChange, 'emit');

      select.value = '10';
      select.dispatchEvent(new Event('change'));

      expect(component.itemsPerPage).toBe('10');
      expect(emitSpy).toHaveBeenCalledWith('10');
    });
  });

  describe('Footer de tabla', () => {
    beforeEach(() => {
      component.products = mockProducts;
      component.ngOnChanges({
        products: {
          currentValue: mockProducts,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      fixture.detectChanges();
    });

    it('debería mostrar el número total de resultados', () => {
      const resultsInfo = fixture.nativeElement.querySelector('.results-info');
      expect(resultsInfo.textContent).toContain(
        `${mockProducts.length} Resultados`
      );
    });

    it('debería mostrar selector de elementos por página', () => {
      const select = fixture.nativeElement.querySelector(
        '.items-per-page-select'
      );
      expect(select).toBeTruthy();

      const options = select.querySelectorAll('option');
      expect(options.length).toBe(3);
      expect(options[0].value).toBe('5');
      expect(options[1].value).toBe('10');
      expect(options[2].value).toBe('20');
    });
  });

  describe('Casos edge', () => {
    it('debería manejar lista vacía de productos', () => {
      component.products = [];
      component.ngOnChanges({
        products: {
          currentValue: [],
          previousValue: mockProducts,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.paginatedProducts).toEqual([]);
      expect(component.totalResults).toBe(0);
    });

    it('debería manejar itemsPerPage de 0', () => {
      component.products = mockProducts;
      component.itemsPerPage = 0;
      component.ngOnChanges({
        products: {
          currentValue: mockProducts,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
        itemsPerPage: {
          currentValue: 0,
          previousValue: 5,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.paginatedProducts).toEqual([]);
    });

    it('debería manejar productos con datos faltantes gracefully', () => {
      const incompleteProducts = [
        {
          id: 'incomplete-1',
          name: 'Product',
          description: '',
          logo: '',
          date_release: '2024-01-01',
          date_revision: '2025-01-01',
        },
      ] as Product[];

      component.products = incompleteProducts;
      component.ngOnChanges({
        products: {
          currentValue: incompleteProducts,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(component.paginatedProducts).toEqual(incompleteProducts);
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('debería manejar URLs de imagen inválidas', () => {
      const productsWithBadLogos = mockProducts.map((p) => ({
        ...p,
        logo: 'invalid-url',
      }));

      component.products = productsWithBadLogos;
      component.ngOnChanges({
        products: {
          currentValue: productsWithBadLogos,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      fixture.detectChanges();

      const logoImages =
        fixture.nativeElement.querySelectorAll('.product-logo');
      expect(logoImages.length).toBe(productsWithBadLogos.length);
    });
  });

  describe('Accesibilidad', () => {
    beforeEach(() => {
      component.products = mockProducts;
      component.ngOnChanges({
        products: {
          currentValue: mockProducts,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      fixture.detectChanges();
    });

    it('debería tener alt text apropiado para imágenes', () => {
      const logoImages =
        fixture.nativeElement.querySelectorAll('.product-logo');

      logoImages.forEach((img: HTMLImageElement, index: number) => {
        expect(img.alt).toBe(component.paginatedProducts[index].name);
      });
    });

    it('debería tener estructura de tabla semántica', () => {
      const table = fixture.nativeElement.querySelector('table');
      const thead = fixture.nativeElement.querySelector('thead');
      const tbody = fixture.nativeElement.querySelector('tbody');

      expect(table).toBeTruthy();
      expect(thead).toBeTruthy();
      expect(tbody).toBeTruthy();
    });

    it('debería tener headers de tabla apropiados', () => {
      const headers = fixture.nativeElement.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('debería usar trackBy para optimizar renderizado', () => {
      const trackBySpy = jest.spyOn(component, 'trackByProductId');

      component.products = mockProducts;
      component.ngOnChanges({
        products: {
          currentValue: mockProducts,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      fixture.detectChanges();

      // El trackBy se usa internamente por ngFor, verificamos que la función existe
      expect(component.trackByProductId).toBeDefined();
      expect(typeof component.trackByProductId).toBe('function');
    });

    it('debería manejar listas grandes eficientemente', () => {
      const largeProductList = Array.from({ length: 100 }, (_, i) => ({
        id: `product-${i}`,
        name: `Product ${i}`,
        description: `Description ${i}`,
        logo: `https://example.com/logo${i}.jpg`,
        date_release: '2024-01-01',
        date_revision: '2025-01-01',
      }));

      const start = performance.now();

      component.products = largeProductList;
      component.itemsPerPage = 20;
      component.ngOnChanges({
        products: {
          currentValue: largeProductList,
          previousValue: [],
          firstChange: true,
          isFirstChange: () => true,
        },
        itemsPerPage: {
          currentValue: 20,
          previousValue: 5,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      const end = performance.now();
      const processingTime = end - start;

      expect(component.paginatedProducts.length).toBe(20);
      expect(processingTime).toBeLessThan(50); // Debería procesar en menos de 50ms
    });
  });
});
