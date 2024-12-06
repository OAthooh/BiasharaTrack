import { Product } from "../types/inventory";
import { StockAlert } from "../types/inventory";
import { SaleFormData, SalesTransaction } from "../types/sales";

const API_URL = 'http://localhost:8080';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ProductResponse {
  product: Product;
  quantity: number;
}

export const inventoryApi = {
  createProduct: async (data: {
    name: string;
    description: string;
    category: string;
    price: number;
    barcode: string;
    quantity: number;
    low_stock_threshold: string;
    image: File | null;
  }): Promise<ApiResponse<Product>> => {
    try {
      const formData = new FormData();
      
      // Add product data
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('price', String(data.price));
      formData.append('barcode', data.barcode);
      formData.append('quantity', String(data.quantity));
      formData.append('low_stock_threshold', data.low_stock_threshold);

      // Add image if exists
      if (data.image) {
        formData.append('image', data.image, data.image.name);
      }

      const response = await fetch(`${API_URL}/create-product`, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create product');
      }

      return {
        success: true,
        data: responseData as Product
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  },

  getAllProducts: async (): Promise<ApiResponse<ProductResponse[]>> => {
    try {
      const response = await fetch(`${API_URL}/get-all-products`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      return {
        success: true,
        data: data as ProductResponse[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  },

  getProduct: async (id: number): Promise<ApiResponse<Product>> => {
    try {
      const response = await fetch(`${API_URL}/get-product/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product');
      }

      return {
        success: true,
        data: data as Product
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  ,

  getLowStockAlerts: async (): Promise<ApiResponse<StockAlert[]>> => {
    try {
      const response = await fetch(`${API_URL}/get-low-stock-alerts`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch low stock alerts');
      }

      return {
        success: true,
        data: data as StockAlert[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  ,

  lookupBarcode: async (barcode: string): Promise<ApiResponse<Product | null>> => {
    try {
      const response = await fetch(`${API_URL}/lookup-barcode?barcode=${barcode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to lookup barcode');
      }

      return {
        success: true,
        data: data as Product
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  ,

  searchProducts: async (query: string): Promise<ApiResponse<Product[]>> => {
    try {
      const response = await fetch(`${API_URL}/search-products?q=${query}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search products');
      }

      return {
        success: true,
        data: data as Product[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  ,

  recordSale: async (saleData: SaleFormData): Promise<ApiResponse<null>> => {
    try {
      console.log("saleData====>",saleData);
      const response = await fetch(`${API_URL}/record-sale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record sale');
      }

      return {
        success: true,
        data: null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
  ,

  fetchSalesHistory: async (): Promise<ApiResponse<SalesTransaction[]>> => {
    try {
      const response = await fetch(`${API_URL}/sales-history`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sales history');
      }

      return {
        success: true,
        data: data as SalesTransaction[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
};
