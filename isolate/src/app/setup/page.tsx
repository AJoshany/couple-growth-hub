import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CoupleSetupForm } from "./couple-setup-form";
import { JoinForm } from "./join-form";

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  // If user already has a couple, redirect to dashboard
  if (session.user.coupleId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Set Up Your Couple</h1>
          <p className="mt-2 text-muted-foreground">
            Create a new couple or join your partner with an invitation code.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-center text-sm font-medium text-muted-foreground">
              New here?
            </h2>
            <CoupleSetupForm />
          </div>
          <div className="space-y-4">
            <h2 className="text-center text-sm font-medium text-muted-foreground">
              Got an invitation?
            </h2>
            <JoinForm />
          </div>
        </div>
      </div>
    </div>
  );
}
