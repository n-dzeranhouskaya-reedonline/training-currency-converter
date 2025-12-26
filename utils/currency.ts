import { Currency } from '@/types';

// List of supported currencies with their details
export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
];

/**
 * Get currency by code
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find((currency) => currency.code === code);
}

/**
 * Format amount with proper decimal places
 */
export function formatAmount(amount: number, decimals: number = 2): string {
  return amount.toFixed(decimals);
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number
): number {
  // Convert to base currency first, then to target currency
  const baseAmount = amount / fromRate;
  return baseAmount * toRate;
}

/**
 * Format currency display
 */
export function formatCurrencyDisplay(
  amount: number,
  currencyCode: string
): string {
  const currency = getCurrencyByCode(currencyCode);
  const formattedAmount = formatAmount(amount);
  
  if (currency) {
    return `${currency.symbol}${formattedAmount}`;
  }
  
  return `${currencyCode} ${formattedAmount}`;
}

/**
 * Validate amount input
 */
export function validateAmount(value: string): {
  isValid: boolean;
  error?: string;
} {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Please enter an amount' };
  }

  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (numValue <= 0) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }

  if (numValue > 1000000000) {
    return { isValid: false, error: 'Amount is too large' };
  }

  return { isValid: true };
}
