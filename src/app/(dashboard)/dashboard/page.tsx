import { getFriendsByUserId } from "@/lib/helpers/get-friends-by-user-id";
import { currentUser } from "@clerk/nextjs/app-beta";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { fetchRedis } from "@/lib/helpers/fetchRedis";
import { chatHrefConstructor } from "@/lib/utils";
import { Message } from "@/lib/helpers/validators/messageValidator";

const Page = async () => {
  // Enfore that the user is logged in
  const sessionUser = await currentUser();
  if (!sessionUser) notFound();

  // Get friends of user
  const friends = await getFriendsByUserId(sessionUser.id);

  // Get recent messages from friends
  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      // Get the most recent message from friends
      const [lastMessageJSON] = (await fetchRedis(
        "zrange",
        `chat:${chatHrefConstructor(sessionUser.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[];

      // Parse json message
      const lastMessage = JSON.parse(lastMessageJSON) as Message;

      // Return the friend and their most recent message
      return {
        ...friend,
        lastMessage,
      };
    })
  );

  return (
    <div className="container py-12">
      <h1 className="mb-8 text-5xl font-bold">Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div
            key={friend.id}
            className="relative rounded-md border border-zinc-200 bg-zinc-50 p-3"
          >
            <div className="absolute inset-y-0 right-4 flex items-center">
              <ChevronRight className="h-7 w-7 text-zinc-400" />
            </div>

            <Link
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionUser.id,
                friend.id
              )}`}
              className="relative sm:flex"
            >
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <div className="relative h-6 w-6">
                  <Image
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    alt={`${friend.firstName} ${friend.lastName} profile picture`}
                    src={friend.profileImageUrl}
                    fill
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold">{`${friend.firstName} ${friend.lastName}`}</h4>
                <p className="mt-1 max-w-md">
                  <span className="text-zinc-400">
                    {friend.lastMessage.senderId === sessionUser.id
                      ? "You: "
                      : ""}
                  </span>
                  {friend.lastMessage.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default Page;
