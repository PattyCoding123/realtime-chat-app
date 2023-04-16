import { clerkClient } from "@clerk/nextjs/app-beta";
import { fetchRedis } from "./fetchRedis";
import { User } from "@clerk/nextjs/dist/api";

export interface ClientUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string;
}

export const getFriendsByUserId = async (
  userId: string
): Promise<ClientUser[]> => {
  // Retrieve the friends of the current user
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  // Enrich the friends with their details using Clerk's user API
  const friends =
    friendIds.length > 0
      ? (await clerkClient.users.getUserList({ userId: friendIds })).map(
          (user) => {
            return {
              id: user.id,
              email: user.emailAddresses[0].emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImageUrl: user.profileImageUrl,
            };
          }
        )
      : [];

  return friends;
};
