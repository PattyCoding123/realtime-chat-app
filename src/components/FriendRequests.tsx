"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Check, UserPlus, X } from "lucide-react";
import { FC, useState } from "react";

interface FriendRequestsProps {
  sessionUserId: string;
  incomingFriendRequests: IncomingFriendRequest[];
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionUserId,
}) => {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );

  // Callback to call the acceptFriend route handler
  const acceptFriend = async (senderId: string) => {
    await axios.post("/api/friends/accept", { id: senderId });

    // Remove the friend request from the list
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );

    router.refresh();
  };

  // Callback to call the denyFriend route handler
  const denyFriend = async (senderId: string) => {
    await axios.post("/api/friends/deny", { id: senderId });

    // Remove the friend request from the list
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );

    router.refresh();
  };

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No friend requests at the moment.
        </p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex items-center gap-4">
            <UserPlus className="text-black" />
            <p className="text-lg font-medium">{request.senderEmail}</p>
            <button
              aria-label="accept friend"
              className="grid h-8 w-8 place-content-center rounded-full bg-indigo-600 transition hover:bg-indigo-700 hover:shadow-md"
              onClick={() => acceptFriend(request.senderId)}
            >
              <Check className="h-11/12 w-11/12 font-semibold text-white" />
            </button>
            <button
              aria-label="deny friend"
              className="grid h-8 w-8 place-content-center rounded-full bg-red-600 transition hover:bg-red-700 hover:shadow-md"
              onClick={() => denyFriend(request.senderId)}
            >
              <X className="h-11/12 w-11/12 font-semibold text-white" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;