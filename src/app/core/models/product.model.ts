/**
 * @description Representa un producto financiero con toda su información básica
 * @interface Product
 * @since 1.0.0
 */
export interface Product {
  /** @description Identificador único del producto */
  id: string;
  /** @description Nombre comercial del producto */
  name: string;
  /** @description Descripción detallada del producto y sus características */
  description: string;
  /** @description URL o ruta del logotipo del producto */
  logo: string;
  /** @description Fecha de lanzamiento del producto en formato ISO string */
  date_release: string;
  /** @description Fecha de revisión del producto en formato ISO string */
  date_revision: string;
}

/**
 * @description Respuesta del servidor que contiene una lista de productos
 * @interface ProductResponse
 * @since 1.0.0
 */
export interface ProductResponse {
  /** @description Array de productos obtenidos del servidor */
  data: Product[];
}

/**
 * @description Respuesta del servidor al crear un nuevo producto
 * @interface ProductCreateResponse
 * @since 1.0.0
 */
export interface ProductCreateResponse {
  /** @description Mensaje de confirmación de la operación de creación */
  message: string;
  /** @description Producto creado con todos sus datos incluyendo el ID generado */
  data: Product;
}

/**
 * @description Respuesta del servidor al actualizar un producto existente
 * @interface ProductUpdateResponse
 * @since 1.0.0
 */
export interface ProductUpdateResponse {
  /** @description Mensaje de confirmación de la operación de actualización */
  message: string;
  /** @description Datos del producto actualizado sin incluir el ID */
  data: Omit<Product, 'id'>;
}

/**
 * @description Respuesta del servidor al eliminar un producto
 * @interface ProductDeleteResponse
 * @since 1.0.0
 */
export interface ProductDeleteResponse {
  /** @description Mensaje de confirmación de la operación de eliminación */
  message: string;
}