import { fetchRedis } from "@/lib/helpers/fetchRedis";
import { db } from "@/lib/db";
// import { pusherServer } from "@/lib/pusher";
// import { toPusherKey } from "@/lib/utils";
import { addFriendValidator } from "@/lib/utils";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextApiRequest } from "next";
import { z } from "zod";
import userIdExists from "@/lib/helpers/userIdExists";

const ACCESS_USER = 0;

export async function POST(req: NextApiRequest) {
  try {
    const { email: emailToAdd } = addFriendValidator.parse({
      email: req.body.email,
    });

    const userToAdd = await clerkClient.users.getUserList({
      emailAddress: [emailToAdd],
      limit: 1,
    });

    if (!userToAdd.length) {
      return new Response("This person does not exist.", { status: 400 });
    }

    const session = getAuth(req);
    const idToAdd = userToAdd[ACCESS_USER].id;

    if (!session || !session.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (idToAdd === session.userId) {
      return new Response("You cannot add yourself as a friend", {
        status: 400,
      });
    }

    // Check if users exists in redis
    await Promise.all([userIdExists(idToAdd), userIdExists(session.userId)]);

    // check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${userToAdd[ACCESS_USER].id}:incoming_friend_requests`,
      session.userId
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Already added this user", { status: 400 });
    }

    // check if user is already added
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.userId}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return new Response("Already friends with this user", { status: 400 });
    }

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
