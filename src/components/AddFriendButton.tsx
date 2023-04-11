"use client"; // This file is only used by the client

import { FC } from "react";
import Button from "./ui/Button";

interface AddFriendButtonProps {}

const AddFriendBUtton: FC<AddFriendButtonProps> = ({}) => {
  return (
    <form className="maw-w-sm">
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by email
      </label>

      <div className="mt-2 flex gap-4">
        <input
          type="text"
          className="right-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="email@example.com"
        />
        <Button>Add</Button>
      </div>
    </form>
  );
};

export default AddFriendBUtton;
