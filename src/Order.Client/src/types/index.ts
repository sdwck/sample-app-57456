export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface ProductRequest {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  productId: number;
  quantity: number;
  status: string;
  createdAt: string;
}

export interface OrderRequest {
  productId: number;
  quantity: number;
}

export interface OrderUpdateRequest {
  quantity: number;
  status: string;
}