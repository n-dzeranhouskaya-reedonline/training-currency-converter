import { CURRENCIES, formatAmount } from '@/utils/currency';

interface ConversionResultProps {
  result: number | null;
  fromCurrency: string;
  toCurrency: string;
  rate: number | null;
}

export default function ConversionResult({ 
  result, 
  fromCurrency, 
  toCurrency, 
  rate 
}: ConversionResultProps) {
  if (result === null) return null;

  const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);
  const fromCurrencyData = CURRENCIES.find(c => c.code === fromCurrency);

  return (
    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-2">Converted Amount</div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {toCurrencyData?.symbol}
          {formatAmount(result)}
        </div>
        {rate && (
          <div className="text-sm text-gray-600">
            1 {fromCurrencyData?.symbol || fromCurrency} = {formatAmount(rate, 4)} {toCurrencyData?.symbol || toCurrency}
          </div>
        )}
      </div>
    </div>
  );
}
