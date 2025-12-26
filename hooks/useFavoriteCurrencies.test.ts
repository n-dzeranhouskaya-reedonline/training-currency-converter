import { renderHook, act } from '@testing-library/react';
import { useFavoriteCurrencies } from './useFavoriteCurrencies';
import * as favoritesUtils from '@/utils/favorites';

// Mock the favorites utilities
jest.mock('@/utils/favorites');

const mockedGetFavorites = favoritesUtils.getFavorites as jest.MockedFunction<
  typeof favoritesUtils.getFavorites
>;
const mockedSaveFavorites = favoritesUtils.saveFavorites as jest.MockedFunction<
  typeof favoritesUtils.saveFavorites
>;
const mockedGetMaxFavorites = favoritesUtils.getMaxFavorites as jest.MockedFunction<
  typeof favoritesUtils.getMaxFavorites
>;
const mockedIsLocalStorageAvailable = favoritesUtils.isLocalStorageAvailable as jest.MockedFunction<
  typeof favoritesUtils.isLocalStorageAvailable
>;

describe('useFavoriteCurrencies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetFavorites.mockReturnValue([]);
    mockedGetMaxFavorites.mockReturnValue(5);
    mockedIsLocalStorageAvailable.mockReturnValue(true);
  });

  describe('initialization', () => {
    it('should initialize with empty favorites', () => {
      const { result } = renderHook(() => useFavoriteCurrencies());

      expect(result.current.favorites).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should load favorites from localStorage on mount', () => {
      mockedGetFavorites.mockReturnValue(['USD', 'EUR', 'GBP']);

      const { result } = renderHook(() => useFavoriteCurrencies());

      expect(mockedGetFavorites).toHaveBeenCalledTimes(1);
      expect(result.current.favorites).toEqual(['USD', 'EUR', 'GBP']);
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorited currencies', () => {
      mockedGetFavorites.mockReturnValue(['USD', 'EUR']);

      const { result } = renderHook(() => useFavoriteCurrencies());

      expect(result.current.isFavorite('USD')).toBe(true);
      expect(result.current.isFavorite('EUR')).toBe(true);
    });

    it('should return false for non-favorited currencies', () => {
      mockedGetFavorites.mockReturnValue(['USD', 'EUR']);

      const { result } = renderHook(() => useFavoriteCurrencies());

      expect(result.current.isFavorite('GBP')).toBe(false);
      expect(result.current.isFavorite('JPY')).toBe(false);
    });
  });

  describe('canAddFavorite', () => {
    it('should return true when under limit', () => {
      mockedGetFavorites.mockReturnValue(['USD', 'EUR']);

      const { result } = renderHook(() => useFavoriteCurrencies());

      expect(result.current.canAddFavorite()).toBe(true);
    });

    it('should return false when at max limit', () => {
      mockedGetFavorites.mockReturnValue(['USD', 'EUR', 'GBP', 'JPY', 'AUD']);

      const { result } = renderHook(() => useFavoriteCurrencies());

      expect(result.current.canAddFavorite()).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('should add currency to favorites', () => {
      const { result } = renderHook(() => useFavoriteCurrencies());

      act(() => {
        result.current.toggleFavorite('USD');
      });

      expect(result.current.favorites).toContain('USD');
      expect(result.current.error).toBeNull();
    });

    it('should remove currency from favorites when already favorited', () => {
      mockedGetFavorites.mockReturnValue(['USD', 'EUR']);

      const { result } = renderHook(() => useFavoriteCurrencies());

      act(() => {
        result.current.toggleFavorite('USD');
      });

      expect(result.current.favorites).not.toContain('USD');
      expect(result.current.favorites).toContain('EUR');
    });

    it('should set error when trying to add 6th favorite', () => {
      mockedGetFavorites.mockReturnValue(['USD', 'EUR', 'GBP', 'JPY', 'AUD']);

      const { result } = renderHook(() => useFavoriteCurrencies());

      act(() => {
        result.current.toggleFavorite('CAD');
      });

      expect(result.current.favorites).not.toContain('CAD');
      expect(result.current.error).toBe(
        'Maximum 5 favorites reached. Remove a favorite to add another.'
      );
    });

    it('should clear error when successfully adding favorite', () => {
      const { result } = renderHook(() => useFavoriteCurrencies());

      // First, trigger an error
      mockedGetFavorites.mockReturnValue(['USD', 'EUR', 'GBP', 'JPY', 'AUD']);
      const { result: errorResult } = renderHook(() => useFavoriteCurrencies());
      
      act(() => {
        errorResult.current.toggleFavorite('CAD');
      });
      
      expect(errorResult.current.error).not.toBeNull();

      // Now remove one and add another
      act(() => {
        errorResult.current.toggleFavorite('USD');
      });

      expect(errorResult.current.error).toBeNull();
    });

    it('should save to localStorage after toggling', () => {
      const { result } = renderHook(() => useFavoriteCurrencies());

      act(() => {
        result.current.toggleFavorite('USD');
      });

      // Wait for useEffect to run
      expect(mockedSaveFavorites).toHaveBeenCalledWith(['USD']);
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      mockedGetFavorites.mockReturnValue(['USD', 'EUR', 'GBP', 'JPY', 'AUD']);

      const { result } = renderHook(() => useFavoriteCurrencies());

      // Trigger error
      act(() => {
        result.current.toggleFavorite('CAD');
      });

      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('localStorage persistence', () => {
    it('should save favorites to localStorage when favorites change', () => {
      const { result } = renderHook(() => useFavoriteCurrencies());

      act(() => {
        result.current.toggleFavorite('USD');
      });

      act(() => {
        result.current.toggleFavorite('EUR');
      });

      expect(mockedSaveFavorites).toHaveBeenCalled();
    });

    it('should handle localStorage unavailability gracefully', () => {
      mockedIsLocalStorageAvailable.mockReturnValue(false);

      const { result } = renderHook(() => useFavoriteCurrencies());

      act(() => {
        result.current.toggleFavorite('USD');
      });

      // Should not throw error
      expect(result.current.favorites).toContain('USD');
    });
  });
});
