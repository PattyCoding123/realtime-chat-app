import { notFound } from "next/navigation";
import { clerkClient, currentUser } from "@clerk/nextjs/app-beta";
import { User } from "@clerk/nextjs/dist/api";

import { fetchRedis } from "@/lib/helpers/fetchRedis";
import FriendRequests from "@/components/FriendRequests";

const FIRST_EMAIL_INDEX = 0;

const Page = async () => {
  const sessionUser: User | null = await currentUser();

  if (!sessionUser) notFound();

  // ids of people who sent logged in user a friend request
  const incomingSenderIds = (await fetchRedis(
    "smembers",
    `user:${sessionUser.id}:incoming_friend_requests`
  )) as string[];

  // get emails of people who sent logged in user a friend request
  const userEmails =
    incomingSenderIds.length > 0
      ? await clerkClient.users
          .getUserList({
            userId: incomingSenderIds,
          })
          .then((res) =>
            res.map((user) => {
              return {
                senderId: user.id,
                senderEmail:
                  user.emailAddresses[FIRST_EMAIL_INDEX].emailAddress,
              };
            })
          )
      : [];

  return (
    <main className="p-8">
      <h1 className="mb-8 text-5xl font-bold">Add a friend</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          incomingFriendRequests={userEmails}
          sessionUserId={sessionUser.id}
        />
      </div>
    </main>
  );
};

export default Page;
