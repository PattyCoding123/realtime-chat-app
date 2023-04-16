"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

interface FriendRequestSidebarOptionsProps {
  sessionUserId: string; // This is the session ID of the user that is currently logged in.
  initialUnseenRequestCount: number;
}

const FriendRequestSidebarOptions: FC<FriendRequestSidebarOptionsProps> = ({
  sessionUserId,
  initialUnseenRequestCount,
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState(
    initialUnseenRequestCount
  );

  // Client-side, subscribe to the friend request event which will
  // allow us to see new incoming friend requests in real time.
  useEffect(() => {
    // Begin listening to the friend request event (create channel)
    pusherClient.subscribe(
      toPusherKey(`user:${sessionUserId}:incoming_friend_requests`)
    );

    // Define an event handler to be called when a new friend request.
    // When this is triggered from the pusherServer, we will update the state
    // of the unseen requests.
    const friendRequestHandler = () => {
      setUnseenRequestCount((prev) => prev + 1);
    };

    // Bind an event handler to the friend request event, which will
    // be called when a new friend request is received.
    // Check the /api/friends/add route handlers
    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    // Clean up by unsubscribing and unbinding the event handler
    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionUserId}:incoming_friend_requests`)
      );

      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionUserId]);

  return (
    <Link
      href="/dashboard/requests"
      className="group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
    >
      {/* group-hover: indicates all items in the group are being hovered. */}
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium text-gray-400 group-hover:border-indigo-600">
        <User className="h-4 w-4" />
      </div>
      <p className="truncate">Friend Requests</p>
      {unseenRequestCount > 0 ? (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
          {unseenRequestCount}
        </div>
      ) : null}
    </Link>
  );
};

export default FriendRequestSidebarOptions;
