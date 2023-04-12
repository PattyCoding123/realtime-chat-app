import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/app-beta";
import { z } from "zod";

import userIdExists from "@/lib/helpers/userIdExists";
import { fetchRedis } from "@/lib/helpers/fetchRedis";
import { db } from "@/lib/db";
// import { pusherServer } from "@/lib/pusher";
// import { toPusherKey } from "@/lib/utils";
import { idValidator } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const ACCESS_USER = 0;

    const body = await req.json();
    const { id: idToAdd } = idValidator.parse(body);

    const session = auth();

    if (!session.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if users exists in redis
    await Promise.all([userIdExists(idToAdd), userIdExists(session.userId)]);

    // check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${session.userId}:friends`,
      session.userId
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Already friends", { status: 400 });
    }

    const hasFriendRequest = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.userId
    )) as 0 | 1;
    // check if user is already added

    // valid request, send friend request

    // await pusherServer.trigger(
    //   toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
    //   "incoming_friend_requests",
    //   {
    //     senderId: session.user.id,
    //     senderEmail: session.user.email,
    //   }
    // );

    await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.userId);

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}