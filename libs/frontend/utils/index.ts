import nstr from 'nstr';

export * from './styles';

/**
 * Safely convert a value to a number and format it with nstr
 * This prevents nstr from receiving non-numeric values that could cause errors
 */
export function safeNstr(value: unknown, fallback: number = 0): string {
  // Handle null, undefined, empty string
  if (value == null || value === '') {
    return String(fallback);
  }

  // Convert to number
  const numValue = Number(value);

  // If conversion failed or resulted in NaN, use fallback
  if (!Number.isFinite(numValue)) {
    return String(fallback);
  }

  return nstr(numValue);
}
