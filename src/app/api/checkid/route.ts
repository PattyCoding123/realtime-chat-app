import { getAuth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextApiRequest } from "next";

import { fetchRedis } from "@/lib/helpers/redisFetch";
import { db } from "@/lib/db";

export async function GET(req: NextApiRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    redirect("/sign-in");
  }

  const userExists = (await fetchRedis(
    "sismember",
    `user:${userId}`,
    "incoming_friend_requests"
  )) as 0 | 1;

  if (!userExists) {
    // If user does not exist, store user information in Upstash Redis
    await db.hset(`user:${userId}`, { incoming_friend_requests: [] });
  }
  redirect("/");
}
