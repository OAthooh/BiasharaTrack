import { Product } from './inventory';

export interface Sale {
  id: number;
  product_name: string;
  product_id: number;
  quantity: number;
  total_amount: number;
  payment_method: 'cash' | 'mpesa' | 'credit';
  customerName?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SaleProduct {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleFormData {
  products: {
    productId: number;
    quantity: number;
    amount: number;
  }[];
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  customerName: string;
  customerPhone: string;
  referenceNumber: string;
  amount: number;
}

export interface SalesMetrics {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  paymentMethodBreakdown: {
    cash: number;
    mpesa: number;
    credit: number;
  };
  
}
export interface SalesTransaction {
  id: number;
  product_name: string;
  product_id: number;
  payment_method: 'cash' | 'mpesa' | 'credit';
  quantity: number;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

