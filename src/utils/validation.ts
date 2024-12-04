export function validateProduct(formData: {
  name: string;
  price: string;
  quantity: string;
  lowStockThreshold: string;
}) {
  const errors: Record<string, string> = {};

  if (!formData.name.trim()) {
    errors.name = 'Product name is required';
  }

  const price = parseFloat(formData.price);
  if (isNaN(price) || price < 0) {
    errors.price = 'Price must be a positive number';
  }

  const quantity = parseInt(formData.quantity);
  if (isNaN(quantity) || quantity < 0) {
    errors.quantity = 'Quantity must be a positive number';
  }

  const threshold = parseInt(formData.lowStockThreshold);
  if (isNaN(threshold) || threshold < 0) {
    errors.lowStockThreshold = 'Threshold must be a positive number';
  }

  return errors;
}