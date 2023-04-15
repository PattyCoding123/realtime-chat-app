import { auth } from "@clerk/nextjs/app-beta";
import { z } from "zod";

import { idValidator } from "@/lib/utils";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Await json body
    const body = await req.json();

    const session = auth();

    if (!session.userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id: idToDeny } = idValidator.parse(body);

    await db.srem(`user:${session.userId}:incoming_friend_requests`, idToDeny);

    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
