/**
 * @description Representa un error de la API con información detallada del fallo
 * @interface ApiError
 * @since 1.0.0
 */
export interface ApiError {
  /** @description Nombre o tipo del error generado por la API */
  name: string;
  /** @description Mensaje descriptivo del error para identificar la causa */
  message: string;
  /** @description Array opcional de errores adicionales o de validación */
  errors?: any[];
}