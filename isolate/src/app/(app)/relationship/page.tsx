import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RelationshipPageClient } from "./relationship-page-client";

export default async function RelationshipPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  if (!session.user.coupleId) redirect("/setup");

  return <RelationshipPageClient />;
}
