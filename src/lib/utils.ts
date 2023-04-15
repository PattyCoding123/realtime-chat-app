import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

// This is a helper function to merge Tailwind classes with clsx
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Validator function for the add friend form
export const emailValidator = z.object({
  email: z.string().email(),
});

// Validator function for the id
export const idValidator = z.object({ id: z.string() });

// Validator function for Messages
export const messageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  text: z.string(),
  timestamp: z.number(),
});

export const messageArrayValidator = z.array(messageValidator);

export type Message = z.infer<typeof messageValidator>;
