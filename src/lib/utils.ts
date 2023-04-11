import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

import { fetchRedis } from "./helpers/fetchRedis";
import { db } from "./db";

// This is a helper function to merge Tailwind classes with clsx
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Validator function for the add friend form
export const addFriendValidator = z.object({
  email: z.string().email(),
});

// Validator function for checking if userId exists in redis
export async function userIdExistsValidator(userId: string) {
  const userExists = (await fetchRedis("sismember", "user", userId)) as 0 | 1;

  if (!userExists) {
    // If user does not exist, store user information in Upstash Redis
    await db.sadd(`user:${userId}`, "friends", "incoming_friend_requests");
  }
}
