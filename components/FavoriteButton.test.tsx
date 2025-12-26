import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import FavoriteButton from './FavoriteButton';

expect.extend(toHaveNoViolations);

describe('FavoriteButton', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render button with aria-label for non-favorite', () => {
      render(
        <FavoriteButton
          currencyCode="USD"
          isFavorite={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button', {
        name: 'Mark USD as favorite',
      });
      expect(button).toBeInTheDocument();
    });

    it('should render button with aria-label for favorite', () => {
      render(
        <FavoriteButton
          currencyCode="EUR"
          isFavorite={true}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button', {
        name: 'Remove EUR from favorites',
      });
      expect(button).toBeInTheDocument();
    });

    it('should render filled star icon when favorited', () => {
      const { container } = render(
        <FavoriteButton
          currencyCode="USD"
          isFavorite={true}
          onToggle={mockOnToggle}
        />
      );

      // Filled star has fillRule attribute
      const filledStar = container.querySelector('svg[fill="currentColor"]');
      expect(filledStar).toBeInTheDocument();
    });

    it('should render outlined star icon when not favorited', () => {
      const { container } = render(
        <FavoriteButton
          currencyCode="USD"
          isFavorite={false}
          onToggle={mockOnToggle}
        />
      );

      // Outlined star has fill="none" attribute
      const outlinedStar = container.querySelector('svg[fill="none"]');
      expect(outlinedStar).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onToggle with currency code when clicked', async () => {
      const user = userEvent.setup();

      render(
        <FavoriteButton
          currencyCode="GBP"
          isFavorite={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith('GBP');
    });

    it('should call onToggle when Enter key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <FavoriteButton
          currencyCode="JPY"
          isFavorite={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith('JPY');
    });

    it('should call onToggle when Space key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <FavoriteButton
          currencyCode="AUD"
          isFavorite={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith('AUD');
    });

    it('should not call onToggle when disabled', async () => {
      const user = userEvent.setup();

      render(
        <FavoriteButton
          currencyCode="CAD"
          isFavorite={false}
          onToggle={mockOnToggle}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnToggle).not.toHaveBeenCalled();
    });

    it('should have disabled styling when disabled', () => {
      render(
        <FavoriteButton
          currencyCode="CHF"
          isFavorite={false}
          onToggle={mockOnToggle}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('accessibility', () => {
    it('should have no accessibility violations (non-favorite)', async () => {
      const { container } = render(
        <FavoriteButton
          currencyCode="USD"
          isFavorite={false}
          onToggle={mockOnToggle}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (favorite)', async () => {
      const { container } = render(
        <FavoriteButton
          currencyCode="EUR"
          isFavorite={true}
          onToggle={mockOnToggle}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (disabled)', async () => {
      const { container } = render(
        <FavoriteButton
          currencyCode="GBP"
          isFavorite={false}
          onToggle={mockOnToggle}
          disabled={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have focus indicator', () => {
      render(
        <FavoriteButton
          currencyCode="USD"
          isFavorite={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-blue-500');
    });

    it('should have proper button type', () => {
      render(
        <FavoriteButton
          currencyCode="USD"
          isFavorite={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('styling', () => {
    it('should have yellow color for star icon', () => {
      render(
        <FavoriteButton
          currencyCode="USD"
          isFavorite={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-yellow-500');
      expect(button).toHaveClass('hover:text-yellow-600');
    });

    it('should have transition for smooth state changes', () => {
      render(
        <FavoriteButton
          currencyCode="USD"
          isFavorite={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-colors');
      expect(button).toHaveClass('duration-150');
    });
  });
});
