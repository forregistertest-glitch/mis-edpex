import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Global number formatter with thousands separator.
 * Default locale is 'th-TH' (which uses standard Arabic numerals with commas).
 */
export function formatNumber(
    value: number | null | undefined,
    decimals: number = 2,
    options: Intl.NumberFormatOptions = {}
): string {
    if (value === null || value === undefined) return "—";

    return new Intl.NumberFormat("th-TH", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        ...options,
    }).format(value);
}
