import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DateEventForm } from "@/components/dates/date-event-form";

export default async function NewDatePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  return (
    <div className="flex justify-center py-6">
      <DateEventForm mode="create" />
    </div>
  );
}
