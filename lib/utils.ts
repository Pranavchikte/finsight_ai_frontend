import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `₹${Math.abs(amount).toFixed(2)}`;
}

export function formatCurrencyWithSign(amount: number): string {
  const normalizedAmount = amount === 0 ? 0 : amount;
  const sign = normalizedAmount < 0 ? '-' : '';
  return `${sign}₹${Math.abs(normalizedAmount).toFixed(2)}`;
}

export function formatDate(dateString: string, format: 'long' | 'short' | 'time' = 'long'): string {
  console.log('formatDate called with:', dateString, 'format:', format);
  const date = new Date(dateString);
  console.log('Parsed date object:', date);
  console.log('Date toString:', date.toString());

  if (format === 'long') {
    const result = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    console.log('Long format result:', result);
    return result;
  } else if (format === 'short') {
    const result = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    console.log('Short format result:', result);
    return result;
  } else {
    const result = date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    console.log('Time format result:', result);
    return result;
  }
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);

  const dateStr = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateStr} at ${timeStr}`;
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(dateString, 'short');
}