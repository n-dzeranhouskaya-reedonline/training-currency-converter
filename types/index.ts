// Type definitions for the currency converter application

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRates {
  base: string;
  rates: {
    [key: string]: number;
  };
  timestamp?: number;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: number;
}

export interface ConversionHistory {
  conversions: ConversionResult[];
}

export interface ApiResponse {
  success: boolean;
  data?: ExchangeRates;
  error?: string;
}

// Favorite Currencies Types

/**
 * Array of favorited currency codes
 * Stored in localStorage under key 'currency_favorites'
 * Maximum length: 5
 */
export type FavoriteCurrencies = string[];

/**
 * Currency with favorite status metadata
 * Extended from base Currency type with derived isFavorite flag
 */
export interface CurrencyWithFavoriteStatus extends Currency {
  isFavorite: boolean;
}

/**
 * Return type for useFavoriteCurrencies hook
 */
export interface UseFavoriteCurrenciesResult {
  favorites: FavoriteCurrencies;
  isFavorite: (currencyCode: string) => boolean;
  toggleFavorite: (currencyCode: string) => void;
  canAddFavorite: () => boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Props for FavoriteButton component
 */
export interface FavoriteButtonProps {
  currencyCode: string;
  isFavorite: boolean;
  onToggle: (currencyCode: string) => void;
  disabled?: boolean;
}
