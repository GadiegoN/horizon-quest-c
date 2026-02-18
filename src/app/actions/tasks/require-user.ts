"use server";

import { requireUserId } from "@/lib/bank/auth";

export async function requireTasksUserId() {
  return requireUserId();
}
