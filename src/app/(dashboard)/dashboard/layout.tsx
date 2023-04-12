import Link from "next/link";
import { FC, ReactNode } from "react";

import { Icons } from "@/components/Icons";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen w-full">
      <div
        className="flex h-full w-full max-w-xs flex-col gap-y-5 overflow-y-auto 
      border-r border-gray-200 bg-white px-6"
      />
      <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
        <Icons.Logo className="h-8 w-8" />
      </Link>
      {children}
    </div>
  );
};

export default Layout;
