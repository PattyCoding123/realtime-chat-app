import { clerkClient, currentUser } from "@clerk/nextjs/app-beta";
import { notFound } from "next/navigation";

import { fetchRedis } from "@/lib/helpers/fetchRedis";
import { messageArrayValidator } from "@/lib/utils";

interface PageProps {
  params: {
    chatId: string;
  };
}

const getChatMessages = async (chatId: string) => {
  try {
    // Fetch messages for this chat room
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}`,
      0,
      -1
    );

    // Parse the messages
    const dbMessages = results.map((message) => JSON.parse(message) as Message);

    const reverseDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reverseDbMessages);

    return messages;
  } catch (error) {
    notFound();
  }
};

const Page = async ({ params }: PageProps) => {
  const { chatId } = params;

  // Enforce that the user is logged in
  const sessionUser = await currentUser();
  if (!sessionUser) notFound();

  // Enforce that the user is a member of the chat
  const [userId1, userId2] = chatId.split("--");
  if (sessionUser.id !== userId1 && sessionUser.id !== userId2) notFound();

  // Determine the sender and receiver of the chat
  const receiverId = sessionUser.id === userId1 ? userId2 : userId1;
  const receiverUser = await clerkClient.users.getUser(receiverId);
  const initialMessages = await getChatMessages(chatId);
  return <div>{params.chatId}</div>;
};

export default Page;
