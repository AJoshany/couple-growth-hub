import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarPageClient } from "./calendar-page-client";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  return <CalendarPageClient />;
}
