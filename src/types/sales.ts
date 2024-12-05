import { Product } from './inventory';

export interface Sale {
  id: string;
  products: SaleProduct[];
  totalAmount: number;
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  status: 'completed' | 'pending' | 'refunded';
  customerName?: string;
  customerPhone?: string;
  mpesaReference?: string;
  createdAt: Date;
  updatedAt: Date;
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
    productId: string;
    quantity: number;
  }[];
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  customerName?: string;
  customerPhone?: string;
  amount?: string;
  referenceNumber?: string;
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