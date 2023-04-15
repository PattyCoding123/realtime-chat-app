"use client";
import { FC, useState, useEffect } from "react";
import type { User } from "@clerk/nextjs/api";
import { useRouter, usePathname } from "next/navigation";
import { chatHrefConstructor } from "@/lib/utils";

interface SidebarChatListProps {
  sessionUserId: string;
  friends: User[];
}

const FIRST_EMAIL_INDEX = 0;

const SidebarChatList: FC<SidebarChatListProps> = ({
  sessionUserId,
  friends,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

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
      {friends.sort().map((friend) => {
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
            >
              {friend.emailAddresses[FIRST_EMAIL_INDEX].emailAddress}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
