import { FC } from "react";

import AddFriendButton from "@/components/AddFriendButton";

const Page: FC = () => {
  return (
    <main className="p-8">
      <h1 className="mb-8 text-5xl font-bold">Add a friend</h1>
      <AddFriendButton />
    </main>
  );
};

export default Page;
