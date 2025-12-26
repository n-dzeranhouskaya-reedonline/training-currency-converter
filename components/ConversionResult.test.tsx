import { render, screen } from '@testing-library/react';
import ConversionResult from './ConversionResult';

describe('ConversionResult', () => {
  it('should not render when result is null', () => {
    const { container } = render(
      <ConversionResult
        result={null}
        fromCurrency="USD"
        toCurrency="EUR"
        rate={null}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should display converted amount with currency symbol', () => {
    render(
      <ConversionResult
        result={85}
        fromCurrency="USD"
        toCurrency="EUR"
        rate={0.85}
      />
    );
    
    expect(screen.getByText('Converted Amount')).toBeInTheDocument();
    expect(screen.getByText(/€85.00/)).toBeInTheDocument();
  });

  it('should display exchange rate when provided', () => {
    render(
      <ConversionResult
        result={85}
        fromCurrency="USD"
        toCurrency="EUR"
        rate={0.85}
      />
    );
    
    expect(screen.getByText(/1 \$ = 0\.8500 €/)).toBeInTheDocument();
  });

  it('should not display rate when rate is null', () => {
    render(
      <ConversionResult
        result={85}
        fromCurrency="USD"
        toCurrency="EUR"
        rate={null}
      />
    );
    
    expect(screen.queryByText(/1 \$ =/)).not.toBeInTheDocument();
  });

  it('should format result with 2 decimal places', () => {
    render(
      <ConversionResult
        result={85.567}
        fromCurrency="USD"
        toCurrency="EUR"
        rate={0.85567}
      />
    );
    
    expect(screen.getByText(/€85.57/)).toBeInTheDocument();
  });

  it('should format rate with 4 decimal places', () => {
    render(
      <ConversionResult
        result={85}
        fromCurrency="USD"
        toCurrency="EUR"
        rate={0.85123}
      />
    );
    
    expect(screen.getByText(/0\.8512 €/)).toBeInTheDocument();
  });

  it('should handle different currency symbols', () => {
    const { rerender } = render(
      <ConversionResult
        result={100}
        fromCurrency="USD"
        toCurrency="GBP"
        rate={0.73}
      />
    );
    
    expect(screen.getByText(/£100.00/)).toBeInTheDocument();
    
    rerender(
      <ConversionResult
        result={100}
        fromCurrency="EUR"
        toCurrency="JPY"
        rate={130}
      />
    );
    
    expect(screen.getByText(/¥100.00/)).toBeInTheDocument();
  });

  it('should display zero amount correctly', () => {
    render(
      <ConversionResult
        result={0}
        fromCurrency="USD"
        toCurrency="EUR"
        rate={0.85}
      />
    );
    
    expect(screen.getByText(/€0.00/)).toBeInTheDocument();
  });

  it('should handle Georgian Lari (GEL) currency', () => {
    render(
      <ConversionResult
        result={268}
        fromCurrency="USD"
        toCurrency="GEL"
        rate={2.68}
      />
    );
    
    expect(screen.getByText(/₾268.00/)).toBeInTheDocument();
    expect(screen.getByText(/1 \$ = 2\.6800 ₾/)).toBeInTheDocument();
  });

  it('should handle Belarusian Ruble (BYN) currency', () => {
    render(
      <ConversionResult
        result={327}
        fromCurrency="USD"
        toCurrency="BYN"
        rate={3.27}
      />
    );
    
    expect(screen.getByText(/Br327.00/)).toBeInTheDocument();
    expect(screen.getByText(/1 \$ = 3\.2700 Br/)).toBeInTheDocument();
  });
});
