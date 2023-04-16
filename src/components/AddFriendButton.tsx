"use client"; // This file is only used by the client

import { FC, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";

import Button from "./ui/Button";
import { emailValidator } from "@/lib/helpers/validators/emailValidator";

type FormData = z.infer<typeof emailValidator>;

const AddFriendBUtton: FC = () => {
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(emailValidator),
  });

  const addFriend = async (email: string) => {
    setIsLoading(true);
    try {
      const validatedEmail = emailValidator.parse({ email });
      await axios.post("/api/friends/add", validatedEmail);

      setShowSuccessState(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError("email", { message: error.message });
        return;
      }

      if (error instanceof AxiosError) {
        setError("email", { message: error.response?.data });
        return;
      }

      setError("email", { message: "Something went wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };

  return (
    <form className="max-w-sm" onSubmit={handleSubmit(onSubmit)}>
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by email
      </label>

      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          className="right-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="email@example.com"
        />
        <Button isLoading={isLoading}>Add</Button>
      </div>
      {errors.email && (
        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
      )}
      {showSuccessState && (
        <p className="mt-1 text-sm text-green-600">Friend added!</p>
      )}
    </form>
  );
};

export default AddFriendBUtton;
