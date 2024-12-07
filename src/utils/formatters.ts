export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'KSH 0.00';
  
  try {
    const number = Number(amount);
    if (isNaN(number)) return 'KSH 0.00';
    
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number).replace('KES', 'KSH');
  } catch (error) {
    console.error('Error formatting currency:', error);
    return 'KSH 0.00';
  }
}