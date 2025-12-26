import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConversionHistory from './ConversionHistory';
import { ConversionResult } from '@/types';

const mockConversions: ConversionResult[] = [
  {
    from: 'USD',
    to: 'EUR',
    amount: 100,
    result: 85,
    rate: 0.85,
    timestamp: 1640000000000, // Dec 20, 2021
  },
  {
    from: 'GBP',
    to: 'JPY',
    amount: 50,
    result: 7500,
    rate: 150,
    timestamp: 1640100000000, // Dec 21, 2021
  },
  {
    from: 'EUR',
    to: 'USD',
    amount: 200,
    result: 235.29,
    rate: 1.17645,
    timestamp: 1640200000000, // Dec 22, 2021
  },
];

describe('ConversionHistory', () => {
  const defaultProps = {
    history: mockConversions,
    showHistory: false,
    onToggle: jest.fn(),
    onClear: jest.fn(),
    onLoadConversion: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Conditional Rendering', () => {
    it('should render the component header', () => {
      render(<ConversionHistory {...defaultProps} />);
      
      expect(screen.getByText('Conversion History')).toBeInTheDocument();
    });

    it('should show clear button when history is not empty', () => {
      render(<ConversionHistory {...defaultProps} />);
      
      expect(screen.getByText('Clear History')).toBeInTheDocument();
    });

    it('should hide clear button when history is empty', () => {
      render(<ConversionHistory {...defaultProps} history={[]} />);
      
      expect(screen.queryByText('Clear History')).not.toBeInTheDocument();
    });

    it('should display empty state message when history is empty and shown', () => {
      render(
        <ConversionHistory {...defaultProps} history={[]} showHistory={true} />
      );
      
      expect(screen.getByText('No conversion history yet')).toBeInTheDocument();
    });

    it('should show history list when showHistory is true and history is not empty', () => {
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      expect(screen.getByText(/100.00 USD → 85.00 EUR/)).toBeInTheDocument();
      expect(screen.getByText(/50.00 GBP → 7500.00 JPY/)).toBeInTheDocument();
    });

    it('should hide history list when showHistory is false', () => {
      render(<ConversionHistory {...defaultProps} showHistory={false} />);
      
      expect(screen.queryByText(/100.00 USD → 85.00 EUR/)).not.toBeInTheDocument();
    });
  });

  describe('Button Interactions & Callbacks', () => {
    it('should call onToggle when toggle button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<ConversionHistory {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /hide \(3\)|show \(3\)/i });
      await user.click(toggleButton);
      
      expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onClear when clear button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<ConversionHistory {...defaultProps} />);
      
      const clearButton = screen.getByText('Clear History');
      await user.click(clearButton);
      
      expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
    });

    it('should call onLoadConversion when a history item is clicked', async () => {
      const user = userEvent.setup();
      
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      const historyItem = screen.getByText(/100.00 USD → 85.00 EUR/);
      await user.click(historyItem.closest('div[class*="cursor-pointer"]')!);
      
      expect(defaultProps.onLoadConversion).toHaveBeenCalledTimes(1);
      expect(defaultProps.onLoadConversion).toHaveBeenCalledWith(mockConversions[0]);
    });

    it('should call onLoadConversion with correct data for second item', async () => {
      const user = userEvent.setup();
      
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      const historyItem = screen.getByText(/50.00 GBP → 7500.00 JPY/);
      await user.click(historyItem.closest('div[class*="cursor-pointer"]')!);
      
      expect(defaultProps.onLoadConversion).toHaveBeenCalledWith(mockConversions[1]);
    });

    it('should call onLoadConversion for each different history item', async () => {
      const user = userEvent.setup();
      
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      // Click first item
      const firstItem = screen.getByText(/100.00 USD → 85.00 EUR/);
      await user.click(firstItem.closest('div[class*="cursor-pointer"]')!);
      
      // Click third item
      const thirdItem = screen.getByText(/200.00 EUR → 235.29 USD/);
      await user.click(thirdItem.closest('div[class*="cursor-pointer"]')!);
      
      expect(defaultProps.onLoadConversion).toHaveBeenCalledTimes(2);
      expect(defaultProps.onLoadConversion).toHaveBeenNthCalledWith(1, mockConversions[0]);
      expect(defaultProps.onLoadConversion).toHaveBeenNthCalledWith(2, mockConversions[2]);
    });
  });

  describe('Dynamic Content', () => {
    it('should display "Show" text when showHistory is false', () => {
      render(<ConversionHistory {...defaultProps} showHistory={false} />);
      
      expect(screen.getByText(/Show \(3\)/)).toBeInTheDocument();
    });

    it('should display "Hide" text when showHistory is true', () => {
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      expect(screen.getByText(/Hide \(3\)/)).toBeInTheDocument();
    });

    it('should display correct history count in toggle button', () => {
      render(<ConversionHistory {...defaultProps} />);
      
      expect(screen.getByText(/\(3\)/)).toBeInTheDocument();
    });

    it('should display zero count when history is empty', () => {
      render(<ConversionHistory {...defaultProps} history={[]} />);
      
      expect(screen.getByText(/\(0\)/)).toBeInTheDocument();
    });

    it('should display count of 1 for single item', () => {
      render(
        <ConversionHistory {...defaultProps} history={[mockConversions[0]]} />
      );
      
      expect(screen.getByText(/\(1\)/)).toBeInTheDocument();
    });
  });

  describe('Conversion Data Rendering', () => {
    it('should display amount with correct formatting', () => {
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      expect(screen.getByText(/100.00 USD/)).toBeInTheDocument();
      expect(screen.getByText(/50.00 GBP/)).toBeInTheDocument();
    });

    it('should display result with correct formatting', () => {
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      expect(screen.getByText(/85.00 EUR/)).toBeInTheDocument();
      expect(screen.getByText(/7500.00 JPY/)).toBeInTheDocument();
    });

    it('should display from and to currency codes', () => {
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      // Check for currency codes in conversion display
      expect(screen.getByText(/USD → .* EUR/)).toBeInTheDocument();
      expect(screen.getByText(/GBP → .* JPY/)).toBeInTheDocument();
    });

    it('should display exchange rate with 4 decimal places', () => {
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      expect(screen.getByText(/Rate: 1 USD = 0.8500 EUR/)).toBeInTheDocument();
      expect(screen.getByText(/Rate: 1 GBP = 150.0000 JPY/)).toBeInTheDocument();
      expect(screen.getByText(/Rate: 1 EUR = 1.1764 USD/)).toBeInTheDocument();
    });

    it('should display timestamp as formatted date string', () => {
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      // Check that timestamps are rendered (format depends on locale)
      const timestamps = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|\w+ \d{1,2}, \d{4}/i);
      expect(timestamps.length).toBeGreaterThanOrEqual(3);
    });

    it('should format timestamp using Date.toLocaleString', () => {
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      // Verify that the timestamp is formatted correctly
      const expectedDate = new Date(mockConversions[0].timestamp).toLocaleString();
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty history array', () => {
      render(
        <ConversionHistory {...defaultProps} history={[]} showHistory={true} />
      );
      
      expect(screen.getByText('No conversion history yet')).toBeInTheDocument();
      expect(screen.queryByText('Clear History')).not.toBeInTheDocument();
    });

    it('should handle single conversion item', () => {
      render(
        <ConversionHistory
          {...defaultProps}
          history={[mockConversions[0]]}
          showHistory={true}
        />
      );
      
      expect(screen.getByText(/100.00 USD → 85.00 EUR/)).toBeInTheDocument();
      expect(screen.queryByText(/50.00 GBP/)).not.toBeInTheDocument();
    });

    it('should render all items for multiple conversions', () => {
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      expect(screen.getByText(/100.00 USD → 85.00 EUR/)).toBeInTheDocument();
      expect(screen.getByText(/50.00 GBP → 7500.00 JPY/)).toBeInTheDocument();
      expect(screen.getByText(/200.00 EUR → 235.29 USD/)).toBeInTheDocument();
    });

    it('should handle conversion with large amounts', () => {
      const largeConversion: ConversionResult = {
        from: 'USD',
        to: 'JPY',
        amount: 999999.99,
        result: 149999998.5,
        rate: 150,
        timestamp: Date.now(),
      };

      render(
        <ConversionHistory
          {...defaultProps}
          history={[largeConversion]}
          showHistory={true}
        />
      );
      
      expect(screen.getByText(/999999.99 USD/)).toBeInTheDocument();
      expect(screen.getByText(/149999998.50 JPY/)).toBeInTheDocument();
    });

    it('should handle conversion with small decimal rates', () => {
      const smallRateConversion: ConversionResult = {
        from: 'USD',
        to: 'BTC',
        amount: 1000,
        result: 0.0234,
        rate: 0.0000234,
        timestamp: Date.now(),
      };

      render(
        <ConversionHistory
          {...defaultProps}
          history={[smallRateConversion]}
          showHistory={true}
        />
      );
      
      expect(screen.getByText(/Rate: 1 USD = 0.0000 BTC/)).toBeInTheDocument();
    });

    it('should handle different timestamp formats correctly', () => {
      const conversionsWithDifferentTimestamps: ConversionResult[] = [
        { ...mockConversions[0], timestamp: 0 }, // Unix epoch
        { ...mockConversions[1], timestamp: Date.now() }, // Current time
        { ...mockConversions[2], timestamp: 253402300799999 }, // Far future
      ];

      render(
        <ConversionHistory
          {...defaultProps}
          history={conversionsWithDifferentTimestamps}
          showHistory={true}
        />
      );
      
      // All should render without crashing
      expect(screen.getAllByText(/Rate:/)).toHaveLength(3);
    });

    it('should apply correct CSS classes for interactive elements', () => {
      render(<ConversionHistory {...defaultProps} showHistory={true} />);
      
      const historyItems = screen.getAllByText(/→/).map(el => 
        el.closest('div[class*="cursor-pointer"]')
      );
      
      expect(historyItems[0]).toHaveClass('cursor-pointer');
      expect(historyItems[0]).toHaveClass('hover:bg-gray-50');
    });

    it('should maintain button accessibility', () => {
      render(<ConversionHistory {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2); // Clear and Toggle buttons
    });
  });
});
