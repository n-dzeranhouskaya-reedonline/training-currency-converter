import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CurrencySelect from './CurrencySelect';
import { CURRENCIES } from '@/utils/currency';

describe('CurrencySelect', () => {
  const mockOnChange = jest.fn();
  const mockOnFavoriteToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render button with selected currency', () => {
      render(<CurrencySelect value="USD" onChange={mockOnChange} />);

      const button = screen.getByRole('button', {
        name: /USD - US Dollar/,
      });
      expect(button).toBeInTheDocument();
    });

    it('should display label when provided', () => {
      render(
        <CurrencySelect
          value="USD"
          onChange={mockOnChange}
          label="From Currency"
        />
      );

      expect(screen.getByText('From Currency')).toBeInTheDocument();
    });

    it('should have correct styling classes', () => {
      render(<CurrencySelect value="USD" onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full', 'border', 'rounded-lg');
    });

    it('should render dropdown icon', () => {
      const { container } = render(
        <CurrencySelect value="USD" onChange={mockOnChange} />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('dropdown interaction', () => {
    it('should open dropdown when button is clicked', async () => {
      const user = userEvent.setup();

      render(<CurrencySelect value="USD" onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // Dropdown should be visible
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();

      // Should show all currencies
      CURRENCIES.forEach((currency) => {
        const option = screen.getByRole('option', {
          name: new RegExp(`${currency.code} - ${currency.name}`),
        });
        expect(option).toBeInTheDocument();
      });
    });

    it('should close dropdown when currency is selected', async () => {
      const user = userEvent.setup();

      render(<CurrencySelect value="USD" onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const eurOption = screen.getByRole('option', { name: /EUR - Euro/ });
      await user.click(eurOption);

      expect(mockOnChange).toHaveBeenCalledWith('EUR');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should close dropdown when Escape is pressed', async () => {
      const user = userEvent.setup();

      render(<CurrencySelect value="USD" onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should highlight selected currency in dropdown', async () => {
      const user = userEvent.setup();

      render(<CurrencySelect value="EUR" onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const eurOption = screen.getByRole('option', { name: /EUR - Euro/ });
      expect(eurOption).toHaveClass('bg-blue-100');
    });
  });

  describe('favorites integration', () => {
    it('should display favorite indicator next to selected currency', () => {
      render(
        <CurrencySelect
          value="USD"
          onChange={mockOnChange}
          favorites={['USD', 'EUR']}
        />
      );

      // Should show star indicator for favorite
      expect(screen.getByLabelText('Favorite')).toBeInTheDocument();
    });

    it('should not display favorite indicator for non-favorite currency', () => {
      render(
        <CurrencySelect
          value="GBP"
          onChange={mockOnChange}
          favorites={['USD', 'EUR']}
        />
      );

      // Should not show star indicator
      expect(screen.queryByLabelText('Favorite')).not.toBeInTheDocument();
    });

    it('should sort favorites at top of dropdown', async () => {
      const user = userEvent.setup();

      render(
        <CurrencySelect
          value="USD"
          onChange={mockOnChange}
          favorites={['GBP', 'EUR']}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const options = screen.getAllByRole('option');
      // EUR should be first (alphabetically among favorites)
      expect(options[0]).toHaveTextContent('EUR - Euro');
      // GBP should be second
      expect(options[1]).toHaveTextContent('GBP - British Pound');
    });

    it('should render FavoriteButton for each currency when onFavoriteToggle provided', async () => {
      const user = userEvent.setup();

      render(
        <CurrencySelect
          value="USD"
          onChange={mockOnChange}
          favorites={['USD']}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Should have favorite buttons for all currencies
      const favoriteButtons = screen.getAllByRole('button', {
        name: /favorite/i,
      });
      expect(favoriteButtons.length).toBeGreaterThan(0);
    });

    it('should call onFavoriteToggle when favorite button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <CurrencySelect
          value="USD"
          onChange={mockOnChange}
          favorites={[]}
          onFavoriteToggle={mockOnFavoriteToggle}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const favoriteButton = screen.getByRole('button', {
        name: /Mark EUR as favorite/i,
      });
      await user.click(favoriteButton);

      expect(mockOnFavoriteToggle).toHaveBeenCalledWith('EUR');
    });

    it('should display favorite error message', () => {
      render(
        <CurrencySelect
          value="USD"
          onChange={mockOnChange}
          favorites={['USD', 'EUR', 'GBP', 'JPY', 'AUD']}
          favoriteError="Maximum 5 favorites reached. Remove a favorite to add another."
        />
      );

      expect(
        screen.getByText(
          'Maximum 5 favorites reached. Remove a favorite to add another.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes for dropdown', () => {
      render(<CurrencySelect value="USD" onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      const user = userEvent.setup();

      render(<CurrencySelect value="USD" onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should mark selected option with aria-selected', async () => {
      const user = userEvent.setup();

      render(<CurrencySelect value="EUR" onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      await user.click(button);

      const eurOption = screen.getByRole('option', { name: /EUR - Euro/ });
      expect(eurOption).toHaveAttribute('aria-selected', 'true');
    });
  });
});
