'use client';

import { useState, useRef, useEffect } from 'react';
import { CURRENCIES, sortCurrenciesWithFavorites } from '@/utils/currency';
import { FavoriteCurrencies } from '@/types';
import FavoriteButton from './FavoriteButton';
import ErrorMessage from './ErrorMessage';

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  favorites?: FavoriteCurrencies;
  onFavoriteToggle?: (currencyCode: string) => void;
  favoriteError?: string | null;
}

export default function CurrencySelect({
  value,
  onChange,
  label,
  favorites = [],
  onFavoriteToggle,
  favoriteError,
}: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sort currencies with favorites at top
  const sortedCurrencies = favorites.length > 0
    ? sortCurrenciesWithFavorites(CURRENCIES, favorites)
    : CURRENCIES;

  // Get selected currency details
  const selectedCurrency = CURRENCIES.find((c) => c.code === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCurrencySelect = (currencyCode: string) => {
    onChange(currencyCode);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex-1 w-full sm:w-auto relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none text-lg bg-white cursor-pointer hover:border-gray-400 transition-colors text-left"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {selectedCurrency ? (
            <>
              {selectedCurrency.code} - {selectedCurrency.name}
              {favorites.includes(value) && (
                <span className="text-yellow-500 text-sm" aria-label="Favorite">
                  ★
                </span>
              )}
            </>
          ) : (
            value
          )}
        </span>
      </button>

      {/* Dropdown Icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {sortedCurrencies.map((currency) => {
            const isFavorite = favorites.includes(currency.code);
            const isSelected = currency.code === value;

            return (
              <div
                key={currency.code}
                className={`
                  flex items-center justify-between px-4 py-2 cursor-pointer
                  hover:bg-blue-50 transition-colors
                  ${isSelected ? 'bg-blue-100' : ''}
                `}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleCurrencySelect(currency.code)}
              >
                <span className="flex-1 text-left">
                  {currency.code} - {currency.name}
                </span>

                {onFavoriteToggle && (
                  <FavoriteButton
                    currencyCode={currency.code}
                    isFavorite={isFavorite}
                    onToggle={onFavoriteToggle}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Favorite Error Message */}
      {favoriteError && <ErrorMessage message={favoriteError} />}
    </div>
  );
}

