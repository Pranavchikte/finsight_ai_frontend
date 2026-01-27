import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FIX #11: Consistent Currency Rounding
export function formatCurrency(amount: number): string {
  return `₹${Math.abs(amount).toFixed(2)}`;
}

// FIX #12: Handling Negative Zero Display
export function formatCurrencyWithSign(amount: number): string {
  // Fix negative zero issue
  const normalizedAmount = amount === 0 ? 0 : amount;
  const sign = normalizedAmount < 0 ? '-' : '';
  return `${sign}₹${Math.abs(normalizedAmount).toFixed(2)}`;
}