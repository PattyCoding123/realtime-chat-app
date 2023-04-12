import Link from "next/link";
import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/app-beta";
import type { User } from "@clerk/nextjs/api";

import { Icon, Icons } from "@/components/Icons";
import { SignedIn, UserButton } from "@clerk/nextjs/app-beta";

interface LayoutProps {
  children: ReactNode;
}

interface SidebarOption {
  id: number;
  name: string;
  href: string;
  Icon: Icon;
}

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
  const user: User | null = await currentUser();
  return (
    <div className="flex h-screen w-full">
      <div
        className="flex h-full w-full max-w-xs flex-col gap-y-5 overflow-y-auto 
      border-r border-gray-200 bg-white px-6"
      >
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
            <Icons.Logo className="h-8 w-8" />
          </Link>
        </div>

        <div className="text-xs font-semibold leading-6 text-gray-400">
          Your chats
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>Chats that this user has</li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Overview
              </div>

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
              </ul>
            </li>

            {/* mt-auto pushes this section to the bottom of sidebar */}
            <li className="-mx-6 mt-auto flex items-center">
              <div className="text flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold text-gray-900">
                <SignedIn>
                  <UserButton afterSignOutUrl="/sign-in" signInUrl="/sign-in" />
                </SignedIn>
                {/* For screen readers, sr */}
                <span className="sr-only">Your profile</span>
                <div className="flex flex-col">
                  <span aria-hidden="true">{`${user?.firstName} ${user?.lastName}`}</span>
                  <span className="text-sm text-zinc-400">
                    {user?.emailAddresses[FIRST_EMAIL_INDEX].emailAddress}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
      {children}
    </div>
  );
};

export default Layout;
