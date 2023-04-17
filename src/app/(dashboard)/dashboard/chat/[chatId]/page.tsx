import { clerkClient, currentUser } from "@clerk/nextjs/app-beta";
import { notFound } from "next/navigation";
import Image from "next/image";

import { fetchRedis } from "@/lib/helpers/fetchRedis";
import {
  type Message,
  messageArrayValidator,
} from "@/lib/helpers/validators/messageValidator";
import { userForClient } from "@/lib/helpers/get-friends-by-user-id";
import Messages from "@/components/Messages";
import ChatInput from "@/components/ChatInput";

interface PageProps {
  params: {
    chatId: string;
  };
}

const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    // Fetch messages for this chat room
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
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

// Renders the chats for the current user and the recipient friend
// they selected in the sidebar.
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
  const [receiverUser, initialMessages] = await Promise.all([
    clerkClient.users.getUser(receiverId).then((user) => userForClient(user)),
    getChatMessages(chatId),
  ]);

  // Dynamically calculate the height
  return (
    <div className="flex h-full max-h-[calc(100vh-6rem)] flex-1 flex-col justify-between">
      <div className="flex justify-between border-b-2 border-gray-200 py-3 sm:items-center">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative h-8 w-8 sm:h-12 sm:w-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={receiverUser.profileImageUrl}
                alt={`${receiverUser.username} profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-center text-xl">
              <span className="mr-3 font-semibold text-gray-700">
                {receiverUser.username}
              </span>
            </div>

            <span className="text-sm text-gray-600">
              {receiverUser.emailAddress}
            </span>
          </div>
        </div>
      </div>

      <Messages
        chatId={chatId}
        receiver={receiverUser}
        sessionImg={sessionUser.profileImageUrl}
        sessionUserId={sessionUser.id}
        initialMessages={initialMessages}
      />
      <ChatInput receiverUser={receiverUser} chatId={chatId} />
    </div>
  );
};

export default Page;
