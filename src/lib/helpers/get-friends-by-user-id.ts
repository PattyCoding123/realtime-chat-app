import { clerkClient } from "@clerk/nextjs/app-beta";
import { fetchRedis } from "./fetchRedis";
import { User } from "@clerk/nextjs/dist/api";

export const getFriendsByUserId = async (userId: string): Promise<User[]> => {
  // Retrieve the friends of the current user
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  // Enrich the friends with their details using Clerk's user API
  const friends =
    friendIds.length > 0
      ? await clerkClient.users.getUserList({ userId: friendIds })
      : [];

  return friends;
};
