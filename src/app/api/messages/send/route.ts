import { auth } from "@clerk/nextjs/app-beta";
import { nanoid } from "nanoid";

import { db } from "@/lib/db";
import { fetchRedis } from "@/lib/helpers/fetchRedis";
import {
  messageValidator,
  type Message,
} from "@/lib/helpers/validators/messageValidator";

export async function POST(req: Request) {
  try {
    // Text is a string, and our params is also
    // a string.
    const { text, chatId }: { text: string; chatId: string } = await req.json();

    const session = auth();

    if (!session.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const [userId1, userId2] = chatId.split("--");

    if (session.userId !== userId1 && session.userId !== userId2) {
      return new Response("Unauthorized", { status: 401 });
    }

    const friendId = session.userId === userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.userId}:friends`
    )) as string[];

    // Check if the user and "friend" are friends.
    const isFriend = friendList.includes(friendId);

    // If the user and "friend" are not friends, they should not be able to send messages to each other.
    if (!isFriend) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Add the message to the chat.
    const timestamp = Date.now();
    const messageData: Message = {
      id: nanoid(),
      senderId: session.userId,
      text,
      timestamp,
    };

    const message = messageValidator.parse(messageData);

    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify({ message }),
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
