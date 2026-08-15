export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  color: string;
  size: string;
  stock: number;
  isFeatured: boolean;
}

export interface ProductResponse {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}