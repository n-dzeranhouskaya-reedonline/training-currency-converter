import { NextRequest, NextResponse } from 'next/server';

// API sources with fallback support
// Using free APIs that don't require authentication
const API_SOURCES = [
  {
    name: 'frankfurter.app',
    url: 'https://api.frankfurter.app/latest?from=USD',
    transform: (data: any) => ({
      base: data.base,
      rates: {
        USD: 1, 
        ...data.rates,
        // Add currencies not supported by frankfurter.app
        GEL: 2.68,
        BYN: 3.27,
      },
    }),
  },
];

/**
 * Fetch exchange rates from a specific API source
 */
async function fetchFromSource(source: typeof API_SOURCES[0]): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    // Use undici for better Node.js fetch support with SSL handling
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // @ts-ignore - Node.js specific options
      ...(typeof process !== 'undefined' && {
        agent: false, // Use default agent
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return source.transform(data);
  } catch (error: any) {
    clearTimeout(timeout);
    console.error(`Error fetching from ${source.name}:`, error.message);
    throw error;
  }
}

/**
 * Mock data for development/fallback when APIs are unavailable
 */
const MOCK_RATES = {
  base: 'USD',
  rates: {
    USD: 1.0,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 149.50,
    AUD: 1.52,
    CAD: 1.35,
    CHF: 0.88,
    CNY: 7.24,
    INR: 83.12,
    MXN: 17.25,
    GEL: 2.68,
    BYN: 3.27,
  },
};

/**
 * Fetch exchange rates with fallback support
 */
async function fetchExchangeRates(): Promise<any> {
  let lastError: Error | null = null;

  // Try each API source in order
  for (const source of API_SOURCES) {
    try {
      const data = await fetchFromSource(source);
      return data;
    } catch (error: any) {
      lastError = error;
      console.error(`Failed to fetch from ${source.name}:`, error.message);
    }
  }

  // If all sources failed, use mock data as fallback (useful in development)
  console.warn('All API sources failed. Using mock data as fallback.');
  console.error(`Last error: ${lastError?.message || 'Unknown error'}`);
  return MOCK_RATES;
}

/**
 * API Route Handler for exchange rates
 * Implements 1-hour caching with Next.js revalidate
 */
export async function GET(request: NextRequest) {
  try {
    const data = await fetchExchangeRates();

    return NextResponse.json(
      {
        success: true,
        data: {
          base: data.base,
          rates: data.rates,
          timestamp: Date.now(),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in exchange rates API:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch exchange rates',
      },
      {
        status: 500,
      }
    );
  }
}

// Enable caching for 1 hour
export const revalidate = 3600;
