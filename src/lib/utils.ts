import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// This is a helper function to merge Tailwind classes with clsx
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* This is a helper function to create the dynamic link segments
   for the chat pages. It takes two user IDs and returns a string.
*/
export function chatHrefConstructor(id1: string, id2: string): string {
  const sortedIds = [id1, id2].sort();

  return `${sortedIds[0]}--${sortedIds[1]}`;
}

// Helper function to convert a redis key string to a valid Pusher key
export function toPusherKey(key: string): string {
  return key.replace(/:/g, "__");
}
