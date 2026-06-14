import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines CSS class names intelligently — prevents Tailwind conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
