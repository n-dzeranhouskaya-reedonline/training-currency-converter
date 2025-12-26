import { render, screen } from '@testing-library/react';
import PageFooter from './PageFooter';

describe('PageFooter', () => {
  it('renders copyright notice with current year', () => {
    const currentYear = new Date().getFullYear();
    render(<PageFooter />);
    
    expect(screen.getByText(`© ${currentYear} Godel Technologies. All rights reserved.`)).toBeInTheDocument();
  });

  it('renders exchange rates update message', () => {
    render(<PageFooter />);
    
    expect(screen.getByText('Exchange rates are updated hourly')).toBeInTheDocument();
  });

  it('renders last updated timestamp when provided', () => {
    const timestamp = Date.now();
    render(<PageFooter lastUpdated={timestamp} />);
    
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('does not render last updated when not provided', () => {
    render(<PageFooter />);
    
    expect(screen.queryByText(/Last updated:/)).not.toBeInTheDocument();
  });

  it('has proper styling for copyright text', () => {
    render(<PageFooter />);
    const currentYear = new Date().getFullYear();
    
    const copyrightElement = screen.getByText(`© ${currentYear} Godel Technologies. All rights reserved.`);
    expect(copyrightElement).toHaveClass('mt-3', 'text-gray-500');
  });

  it('renders all footer content in correct order', () => {
    const currentYear = new Date().getFullYear();
    const timestamp = Date.now();
    render(<PageFooter lastUpdated={timestamp} />);
    
    const footerText = screen.getByText('Exchange rates are updated hourly').parentElement?.textContent;
    
    expect(footerText).toContain('Exchange rates are updated hourly');
    expect(footerText).toContain('Last updated:');
    expect(footerText).toContain(`© ${currentYear} Godel Technologies. All rights reserved.`);
  });
});
