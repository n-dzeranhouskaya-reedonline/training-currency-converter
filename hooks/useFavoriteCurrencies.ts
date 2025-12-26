import { useState, useEffect, useCallback } from 'react';
import { UseFavoriteCurrenciesResult, FavoriteCurrencies } from '@/types';
import {
  getFavorites,
  saveFavorites,
  getMaxFavorites,
  isLocalStorageAvailable,
} from '@/utils/favorites';

/**
 * Custom hook for managing favorite currencies
 * Handles state management, localStorage persistence, and validation
 */
export function useFavoriteCurrencies(): UseFavoriteCurrenciesResult {
  const [favorites, setFavorites] = useState<FavoriteCurrencies>([]);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadedFavorites = getFavorites();
    setFavorites(loadedFavorites);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (favorites.length > 0 || isLocalStorageAvailable()) {
      saveFavorites(favorites);
    }
  }, [favorites]);

  /**
   * Check if a currency is in favorites
   */
  const isFavorite = useCallback(
    (currencyCode: string): boolean => {
      return favorites.includes(currencyCode);
    },
    [favorites]
  );

  /**
   * Check if user can add more favorites (under limit)
   */
  const canAddFavorite = useCallback((): boolean => {
    return favorites.length < getMaxFavorites();
  }, [favorites.length]);

  /**
   * Toggle favorite status for a currency
   */
  const toggleFavorite = useCallback(
    (currencyCode: string): void => {
      const isCurrentlyFavorite = favorites.includes(currencyCode);

      if (isCurrentlyFavorite) {
        // Remove from favorites
        setFavorites((prev) => prev.filter((code) => code !== currencyCode));
        setError(null);
      } else {
        // Check if we can add more favorites
        if (favorites.length >= getMaxFavorites()) {
          setError(
            'Maximum 5 favorites reached. Remove a favorite to add another.'
          );
          return;
        }

        // Add to favorites
        setFavorites((prev) => [...prev, currencyCode]);
        setError(null);
      }
    },
    [favorites]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    canAddFavorite,
    error,
    clearError,
  };
}
