import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/app-beta";
import { User } from "@clerk/nextjs/dist/api";

import FriendRequestSidebarOptions from "@/components/FriendRequestsSidebarOptions";
import { Icons } from "@/components/Icons";
import { SignedIn, UserButton } from "@clerk/nextjs/app-beta";
import { fetchRedis } from "@/lib/helpers/fetchRedis";
import {
  userForClient,
  getFriendsByUserId,
} from "@/lib/helpers/get-friends-by-user-id";
import { SidebarOption } from "@/types/typings";
import SidebarChatList from "@/components/SidebarChatList";
import MobileChatLayout from "@/components/MobileChatLayout";

interface LayoutProps {
  children: ReactNode;
}

// Add more sidebar options as needed
const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: "Add friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

const FIRST_EMAIL_INDEX = 0;

const Layout = async ({ children }: LayoutProps) => {
  // Enforce that the user is signed in
  const sessionUser: User | null = await currentUser();
  if (!sessionUser) notFound();

  // Get user's friends
  const friends = await getFriendsByUserId(sessionUser.id);

  // Get session user for client side
  const clientSessionUser = userForClient(sessionUser);

  // Get friend requests
  const unseenRequestCount = (
    (await fetchRedis(
      "smembers",
      `user:${sessionUser.id}:incoming_friend_requests`
    )) as Array<unknown>
  ).length;

  return (
    // Separated into two sections: sidebar and main content
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <div className="md:hidden">
        <MobileChatLayout
          sessionUser={clientSessionUser}
          friends={friends}
          sidebarOptions={sidebarOptions}
          unseenRequestCount={unseenRequestCount}
        />
      </div>
      <div
        className="hidden h-full w-full max-w-xs flex-col gap-y-5 overflow-y-auto border-r 
      border-gray-200 bg-white px-6 md:flex"
      >
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
            <Icons.Logo className="h-8 w-8" />
          </Link>
        </div>

        {/* Render "Your chats" if user has friends */}
        {friends.length > 0 ? (
          <div className="text-xs font-semibold leading-6 text-gray-400">
            Your chats
          </div>
        ) : null}

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {/* Render all available chats */}
            <li>
              <SidebarChatList
                sessionUserId={sessionUser.id}
                friends={friends}
              />
            </li>

            {/* Render all available options */}
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Overview
              </div>

              {/* Render all sidebar options */}
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {sidebarOptions.map((option) => {
                  const Icon = Icons[option.Icon];
                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className="group flex gap-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      >
                        {/* Use shrink-0 so that the flex items do not become smaller than their original size*/}
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600">
                          <Icon className="h-4 w-4" />
                        </span>

                        {/* Cut text off if it overflows */}
                        <span className="truncate">{option.name}</span>
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <FriendRequestSidebarOptions
                    sessionUserId={sessionUser.id}
                    initialUnseenRequestCount={unseenRequestCount}
                  />
                </li>
              </ul>
            </li>

            {/* mt-auto pushes this section to the bottom of sidebar */}
            <li className="-mx-6 mt-auto flex items-center">
              {/* Show profile button and info, powered with Clerk */}
              <div className="text flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold text-gray-900">
                <SignedIn>
                  <UserButton afterSignOutUrl="/sign-in" signInUrl="/sign-in" />
                </SignedIn>
                {/* For screen readers, sr */}
                <span className="sr-only">Your profile</span>
                <div className="flex flex-col">
                  <span aria-hidden="true">{`${sessionUser?.firstName} ${sessionUser?.lastName}`}</span>
                  <span className="text-sm text-zinc-400">
                    {
                      sessionUser?.emailAddresses[FIRST_EMAIL_INDEX]
                        .emailAddress
                    }
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content from other pages */}
      <aside className="container max-h-screen w-full py-16 md:py-12">
        {children}
      </aside>
    </div>
  );
};

export default Layout;
