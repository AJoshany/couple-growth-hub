"use server";

import { auth } from "@/lib/auth";
import { generateWeeklyDigest, formatDigestAsText } from "@/lib/weekly-digest";

export async function getWeeklyDigest() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const digest = await generateWeeklyDigest(session.user.id);
  return digest;
}

export async function getWeeklyDigestAsText() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const digest = await generateWeeklyDigest(session.user.id);
  return formatDigestAsText(digest);
}
