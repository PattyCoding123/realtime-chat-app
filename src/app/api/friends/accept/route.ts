import { clerkClient } from "@clerk/nextjs/app-beta";
import { auth } from "@clerk/nextjs/app-beta";
import { z } from "zod";

import { fetchRedis } from "@/lib/helpers/fetchRedis";
import { db } from "@/lib/db";
import { idValidator } from "@/lib/helpers/validators/idValidator";
// import { pusherServer } from "@/lib/pusher";
// import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id: idToAdd } = idValidator.parse(body);

    const session = auth();

    if (!session.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${session.userId}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Already friends", { status: 400 });
    }

    const hasFriendRequest = (await fetchRedis(
      "sismember",
      `user:${session.userId}:incoming_friend_requests`,
      idToAdd
    )) as 0 | 1;

    if (!hasFriendRequest) {
      return new Response("No friend request", { status: 400 });
    }
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

    // Both users add each other to their friends list, and clear up the incoming friend request
    await Promise.all([
      db.sadd(`user:${idToAdd}:friends`, session.userId),
      db.sadd(`user:${session.userId}:friends`, idToAdd),
      db.srem(`user:${session.userId}:incoming_friend_requests`, idToAdd),
    ]);

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
