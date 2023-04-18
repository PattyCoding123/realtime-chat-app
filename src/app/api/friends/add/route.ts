import { clerkClient } from "@clerk/nextjs/app-beta";
import { auth } from "@clerk/nextjs/app-beta";
import { z } from "zod";

import { fetchRedis } from "@/lib/helpers/fetchRedis";
import { db } from "@/lib/db";
import { emailValidator } from "@/lib/helpers/validators/emailValidator";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { userForClient } from "@/lib/helpers/get-friends-by-user-id";

export async function POST(req: Request) {
  try {
    const ACCESS_USER = 0;

    const body = await req.json();
    const { email: emailToAdd } = emailValidator.parse(body);

    const userToAdd = await clerkClient.users.getUserList({
      emailAddress: [emailToAdd],
      limit: 1,
    });

    if (!userToAdd.length) {
      return new Response("This person does not exist.", { status: 400 });
    }

    const session = auth();
    const idToAdd = userToAdd[ACCESS_USER].id;

    if (!session.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (idToAdd === session.userId) {
      return new Response("You cannot add yourself as a friend", {
        status: 400,
      });
    }

    // check if user already sent a friend request
    const hasFriendRequest = (await fetchRedis(
      "sismember",
      `user:${userToAdd[ACCESS_USER].id}:incoming_friend_requests`,
      session.userId
    )) as 0 | 1;

    if (hasFriendRequest) {
      return new Response("Already added this user", { status: 400 });
    }

    // check if user is already added as a friend
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.userId}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return new Response("Already friends with this user", { status: 400 });
    }

    // valid request, send friend request
    const currentUser = await clerkClient.users
      .getUser(session.userId)
      .then((user) => userForClient(user));

    // Send pusher event to the account that the current user
    // is trying to add.
    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${idToAdd}:incoming_friend_requests`), // Channel that the event will be sent to
        "incoming_friend_requests", // Function name to trigger
        // Information to send to the client
        {
          senderId: session.userId,
          senderEmail: currentUser.emailAddress,
        }
      ),
      db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.userId),
    ]);

    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
