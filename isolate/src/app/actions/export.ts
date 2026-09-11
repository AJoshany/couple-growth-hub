"use server";

import { auth } from "@/lib/auth";
import { exportUserData } from "@/lib/export";

export async function exportData(format: "json" | "csv") {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = await exportUserData(session.user.id);
  
  return {
    data,
    format,
    filename: `couple-growth-hub-export-${new Date().toISOString().split("T")[0]}`,
  };
}
