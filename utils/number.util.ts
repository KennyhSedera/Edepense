// Codes ISO 4217 valides (étends la liste si besoin)
const CURRENCY_MAP: Record<string, string> = {
  'AR': 'MGA',
  'ARIARY': 'MGA',
  'MGA': 'MGA',
  '$': 'USD',
  'DOLLAR': 'USD',
  'DOLLARS': 'USD',
  'USD': 'USD',
  '€': 'EUR',
  'EURO': 'EUR',
  'EUROS': 'EUR',
  'EUR': 'EUR',
  'A': 'MGA',
};

export function normalizeCurrency(currency?: string | null): string {
  if (!currency) return 'MGA';
  return CURRENCY_MAP[currency.trim().toUpperCase()] ?? 'MGA';
}

export function formatMoney(
  value: number | string,
  currency: string = 'MGA',
  locale: string = 'fr-MG'
): string {
  const amount = Number(value) || 0;
  const safeCurrency = normalizeCurrency(currency);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${safeCurrency}`;
  }
}

export function formatCompactNumber(value: number, devise: string = 'MGA'): string {
  const safeCurrency = normalizeCurrency(devise);
  const abs = Math.abs(value);
  const currency = safeCurrency === 'MGA' ? 'Ar' : safeCurrency === 'EUR' ? '€' : '$';

  if (abs >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '')}T ${currency}`;
  }

  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B ${currency}`;
  }

  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M ${currency}`;
  }

  return formatMoney(value, safeCurrency);
}

export function toOrdinalFr(n: number, feminin = false) {
  if (n === 1) return feminin ? "1ère" : "1er";
  return `${n}e`;
}