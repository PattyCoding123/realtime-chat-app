import { db } from "../db";
import { fetchRedis } from "./fetchRedis";

// Validator function for checking if userId exists in redis
export default async function userIdExists(userId: string) {
  try {
    const userExists = (await fetchRedis("sismember", "user", userId)) as 0 | 1;

    if (!userExists) {
      // If user does not exist, store user information in Upstash Redis
      const res = await db.sadd(
        `user:${userId}`,
        "friends",
        "incoming_friend_requests"
      );
      return res;
    }
  } catch (error) {
    throw new Error(`Error executing Redis command`);
  }
}
