export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  barcode: string;
  imageUrl: string;
  quantity: number;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  message: string;
  resolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  barcode: string;
  quantity: string;
  lowStockThreshold: string;
  image: File | null;
}