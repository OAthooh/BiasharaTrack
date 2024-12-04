export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  barcode: string;
  photo_path: string;
  quantity: number;
  low_stock_threshold: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface StockAlert {
  id: number;
  product_id: number;
  product_name: string;
  alert_message: string;
  resolved: boolean;
  created_at: Date;
  current_quantity: number;
  stock_threshold: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  barcode: string;
  quantity: string;
  low_stock_threshold: string;
  photo_path: File | null;
}
