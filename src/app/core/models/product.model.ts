export interface Product {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface ProductResponse {
  data: Product[];
}

export interface ProductCreateResponse {
  message: string;
  data: Product;
}

export interface ProductUpdateResponse {
  message: string;
  data: Omit<Product, 'id'>;
}

export interface ProductDeleteResponse {
  message: string;
}