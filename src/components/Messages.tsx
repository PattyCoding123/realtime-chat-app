"use client";
import { FC, useEffect, useRef, useState } from "react";
import { User } from "@clerk/nextjs/dist/api";
import format from "date-fns/format";
import Image from "next/image";

import type { Message } from "@/lib/helpers/validators/messageValidator";
import { cn, toPusherKey } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";

interface MessagesProps {
  sessionUserId: string;
  sessionImg: string;
  chatId: string;
  receiver: User;
  initialMessages: Message[];
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionUserId,
  chatId,
  sessionImg,
  receiver,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  // Client-side, subscribe to the chat room messaging event
  useEffect(() => {
    // Begin listening to the chat room messaging event (create channel)
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    // Define an event handler to be called when a message is sent
    // to the chat room.
    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    // Bind an event handler to the messaging event, which will
    // be called when a new message is send.
    // Check the /api/messages/sned route handlers
    pusherClient.bind("incoming-message", messageHandler);

    // Clean up by unsubscribing and unbinding the event handler
    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));

      pusherClient.unbind("incoming-message", messageHandler);
    };
  }, [chatId]);

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };

  return (
    <div
      id="messages"
      className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-1 scrolling-touch flex h-full flex-1 flex-col-reverse gap-4 overflow-y-auto p-3"
    >
      <div ref={scrollDownRef} />
      {messages.map((message, index) => {
        // Check if message sender is current user
        const isCurrentUser = message.senderId === sessionUserId;

        // Check if the next message is from the same user (current user or receiver)
        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div
            key={`${message.id}-${message.timestamp}`}
            className="chat-message"
          >
            <div
              className={cn("flex items-end", { "justify-end": isCurrentUser })}
            >
              <div
                className={cn(
                  "mx-2 flex max-w-xs flex-col space-y-2 text-base",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  className={cn("inline-block rounded-lg px-4 py-2", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </span>
              </div>
              <div
                className={cn("relative h-6 w-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={isCurrentUser ? sessionImg : receiver.profileImageUrl}
                  referrerPolicy="no-referrer"
                  alt="Profile picture"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
