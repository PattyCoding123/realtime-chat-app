import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// This is a helper function to merge Tailwind classes with clsx
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
