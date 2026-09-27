import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a count the way Instagram does:
 *   < 1,000          → exact number   e.g. 999
 *   1,000–999,999    → one decimal K, drop .0   e.g. 1K · 1.2K · 10K · 99.9K · 100K
 *   1,000,000+       → one decimal M, drop .0   e.g. 1M · 1.2M
 */
export function fmtCount(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return (Math.floor(v * 10) / 10).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return (Math.floor(v * 10) / 10).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return String(n);
}
