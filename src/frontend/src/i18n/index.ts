import { bnBD } from './bn-BD';

type TranslationKey = string;

// Simple i18n helper that returns Bangla strings
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = bnBD;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Simple interpolation
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
      return params[paramKey]?.toString() || '';
    });
  }
  
  return value;
}

// Currency formatter for BDT
export function formatBDT(amountInCents: number | bigint): string {
  const amount = Number(amountInCents) / 100;
  return `৳${amount.toFixed(2)}`;
}

// Number formatter for Bangla locale
export function formatNumber(num: number | bigint): string {
  return Number(num).toLocaleString('bn-BD');
}
