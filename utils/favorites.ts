import { FavoriteCurrencies } from '@/types';
import { CURRENCIES } from './currency';

const STORAGE_KEY = 'currency_favorites';
const MAX_FAVORITES = 5;

/**
 * Check if localStorage is available
 * Returns false in environments where localStorage is not supported
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get favorite currencies from localStorage
 * Returns empty array if localStorage is unavailable or data is invalid
 */
export function getFavorites(): FavoriteCurrencies {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    
    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      console.warn('Invalid favorites data in localStorage (not an array)');
      return [];
    }

    // Validate currency codes against CURRENCIES list
    const validFavorites = validateFavorites(parsed);
    
    // If validation removed invalid entries, update localStorage
    if (validFavorites.length !== parsed.length) {
      saveFavorites(validFavorites);
    }

    return validFavorites;
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
}

/**
 * Save favorite currencies to localStorage
 * Enforces maximum limit and validates currency codes
 */
export function saveFavorites(favorites: FavoriteCurrencies): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    // Enforce max limit
    const limitedFavorites = favorites.slice(0, MAX_FAVORITES);
    
    // Validate currency codes
    const validFavorites = validateFavorites(limitedFavorites);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validFavorites));
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
}

/**
 * Validate favorite currency codes against CURRENCIES list
 * Filters out any invalid or non-existent currency codes
 */
export function validateFavorites(favorites: FavoriteCurrencies): FavoriteCurrencies {
  const validCurrencyCodes = CURRENCIES.map(c => c.code);
  
  return favorites.filter(code => {
    if (typeof code !== 'string') {
      console.warn(`Invalid favorite currency code (not a string): ${code}`);
      return false;
    }
    
    if (!validCurrencyCodes.includes(code)) {
      console.warn(`Invalid favorite currency code (not in CURRENCIES list): ${code}`);
      return false;
    }
    
    return true;
  });
}

/**
 * Clear all favorites from localStorage
 */
export function clearFavorites(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing favorites from localStorage:', error);
  }
}

/**
 * Get the maximum number of allowed favorites
 */
export function getMaxFavorites(): number {
  return MAX_FAVORITES;
}
