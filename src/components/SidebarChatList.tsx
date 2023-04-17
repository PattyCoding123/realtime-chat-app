"use client";
import { FC, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/helpers/validators/messageValidator";
import { pusherClient } from "@/lib/pusher";
import { toast } from "react-hot-toast";
import { ClientUser } from "@/lib/helpers/get-friends-by-user-id";
import UnseenChatToast from "./UnseenChatToast";

interface SidebarChatListProps {
  sessionUserId: string;
  friends: ClientUser[];
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

// For each chat, we can see the event
const SidebarChatList: FC<SidebarChatListProps> = ({
  sessionUserId,
  friends,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  // Stores ALL unseen messages and friends that we fetch from the database
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<ClientUser[]>(friends);

  // Subscibe to messages events to get toast notification
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionUserId}:chats`));

    pusherClient.subscribe(toPusherKey(`user"${sessionUserId}:friends`));

    const newFriendHandler = (newFriend: ClientUser) => {
      // Update realtime by using state
      setActiveChats((prev) => [...prev, newFriend]);
    };

    const newMessageHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(
          sessionUserId,
          message.senderId
        )}`;

      if (!shouldNotify) return;

      // should be notified
      toast.custom((t) => (
        // Custom component
        <UnseenChatToast
          t={t}
          sessionUserId={sessionUserId}
          senderId={message.senderId}
          senderImg={message.senderImg}
          senderName={message.senderName}
          senderMessage={message.text}
        />
      ));

      setUnseenMessages((prev) => [...prev, message]);
    };

    pusherClient.bind("new_message", newMessageHandler);
    pusherClient.bind("new_friend", newFriendHandler);
    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionUserId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionUserId}:friends`));
      pusherClient.unbind("new_message", newMessageHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
  }, [pathname, sessionUserId, router]);

  useEffect(() => {
    // If the user is on the chat page, remove the messages from the unseenMessages array
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="-mx-2 max-h-[25rem] space-y-1 overflow-y-auto">
      {activeChats.sort().map((friend) => {
        // Get the count of unseen messages for this specific friend.
        const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id;
        }).length;
        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionUserId,
                friend.id
              )}`}
              className="group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            >
              {friend.username}
              {unseenMessagesCount > 0 ? (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                  {unseenMessagesCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
