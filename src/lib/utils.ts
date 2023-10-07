import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// convert to ASCII characters
export function convertToAscii(str: string) {
    return str.replace(/[^\x00-\x7F]/g, "");
}