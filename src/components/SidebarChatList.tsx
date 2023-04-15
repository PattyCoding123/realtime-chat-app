"use client";
import { FC, useState, useEffect } from "react";
import { User } from "@clerk/nextjs/dist/api";
import { useRouter, usePathname } from "next/navigation";
import { chatHrefConstructor } from "@/lib/utils";

interface SidebarChatListProps {
  sessionUserId: string;
  friends: User[];
}

const SidebarChatList: FC<SidebarChatListProps> = ({
  sessionUserId,
  friends,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Stores ALL unseen messages that we fetch from the database.
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
              className="group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            >
              {friend.firstName} {friend.lastName}
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
