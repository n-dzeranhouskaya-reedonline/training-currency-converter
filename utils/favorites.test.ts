import {
  getFavorites,
  saveFavorites,
  validateFavorites,
  clearFavorites,
  getMaxFavorites,
  isLocalStorageAvailable,
} from './favorites';
import { CURRENCIES } from './currency';

describe('favorites utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('isLocalStorageAvailable', () => {
    it('should return true in test environment with localStorage', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('should return false if localStorage throws error', () => {
      // Save original localStorage
      const originalLocalStorage = global.localStorage;
      
      // Replace with mock that throws
      Object.defineProperty(global, 'localStorage', {
        value: {
          setItem: jest.fn(() => {
            throw new Error('localStorage unavailable');
          }),
          getItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn(),
        },
        writable: true,
      });

      expect(isLocalStorageAvailable()).toBe(false);

      // Restore original localStorage
      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });
  });

  describe('getFavorites', () => {
    it('should return empty array when no favorites are stored', () => {
      expect(getFavorites()).toEqual([]);
    });

    it('should return stored favorites', () => {
      localStorage.setItem('currency_favorites', JSON.stringify(['USD', 'EUR', 'GBP']));
      expect(getFavorites()).toEqual(['USD', 'EUR', 'GBP']);
    });

    it('should return empty array if localStorage data is invalid JSON', () => {
      localStorage.setItem('currency_favorites', 'invalid json');
      expect(getFavorites()).toEqual([]);
    });

    it('should return empty array if localStorage data is not an array', () => {
      localStorage.setItem('currency_favorites', JSON.stringify({ code: 'USD' }));
      expect(getFavorites()).toEqual([]);
    });

    it('should filter out invalid currency codes', () => {
      localStorage.setItem('currency_favorites', JSON.stringify(['USD', 'INVALID', 'EUR']));
      const favorites = getFavorites();
      expect(favorites).toEqual(['USD', 'EUR']);
    });

    it('should return empty array when localStorage is unavailable', () => {
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      expect(getFavorites()).toEqual([]);

      getItemSpy.mockRestore();
    });
  });

  describe('saveFavorites', () => {
    it('should save valid favorites to localStorage', () => {
      saveFavorites(['USD', 'EUR', 'GBP']);
      const stored = localStorage.getItem('currency_favorites');
      expect(stored).toBe(JSON.stringify(['USD', 'EUR', 'GBP']));
    });

    it('should enforce maximum limit of 5 favorites', () => {
      saveFavorites(['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']);
      const stored = localStorage.getItem('currency_favorites');
      expect(JSON.parse(stored!)).toEqual(['USD', 'EUR', 'GBP', 'JPY', 'AUD']);
      expect(JSON.parse(stored!)).toHaveLength(5);
    });

    it('should filter out invalid currency codes before saving', () => {
      saveFavorites(['USD', 'INVALID', 'EUR']);
      const stored = localStorage.getItem('currency_favorites');
      expect(JSON.parse(stored!)).toEqual(['USD', 'EUR']);
    });

    it('should handle localStorage errors gracefully', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      expect(() => saveFavorites(['USD', 'EUR'])).not.toThrow();

      setItemSpy.mockRestore();
    });
  });

  describe('validateFavorites', () => {
    it('should return valid currency codes', () => {
      const validCodes = ['USD', 'EUR', 'GBP'];
      expect(validateFavorites(validCodes)).toEqual(validCodes);
    });

    it('should filter out invalid currency codes', () => {
      const mixed = ['USD', 'INVALID', 'EUR', 'FAKE'];
      expect(validateFavorites(mixed)).toEqual(['USD', 'EUR']);
    });

    it('should filter out non-string values', () => {
      const mixed = ['USD', 123 as any, 'EUR', null as any];
      expect(validateFavorites(mixed)).toEqual(['USD', 'EUR']);
    });

    it('should return empty array if all codes are invalid', () => {
      expect(validateFavorites(['INVALID', 'FAKE'])).toEqual([]);
    });

    it('should validate against actual CURRENCIES list', () => {
      const validCode = CURRENCIES[0].code;
      expect(validateFavorites([validCode])).toEqual([validCode]);
    });
  });

  describe('clearFavorites', () => {
    it('should remove favorites from localStorage', () => {
      localStorage.setItem('currency_favorites', JSON.stringify(['USD', 'EUR']));
      clearFavorites();
      expect(localStorage.getItem('currency_favorites')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      expect(() => clearFavorites()).not.toThrow();

      removeItemSpy.mockRestore();
    });
  });

  describe('getMaxFavorites', () => {
    it('should return 5', () => {
      expect(getMaxFavorites()).toBe(5);
    });
  });
});
