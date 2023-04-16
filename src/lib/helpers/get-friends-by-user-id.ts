import { clerkClient } from "@clerk/nextjs/app-beta";
import { fetchRedis } from "./fetchRedis";

export interface ClientUser {
  id: string;
  emailAddress: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string;
}

const FIRST_EMAIL_INDEX = 0;

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
              emailAddress: user.emailAddresses[FIRST_EMAIL_INDEX].emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImageUrl: user.profileImageUrl,
            };
          }
        )
      : [];

  return friends;
};
