import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CoupleSetupForm } from "./couple-setup-form";
import { JoinForm } from "./join-form";
import { Card } from "@/components/ui/card";
import { logout } from "@/app/actions/auth";
import { Heart } from "lucide-react";
import Link from "next/link";

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  // If user already has a couple, redirect to dashboard
  if (session.user.coupleId) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-72" />
      <div className="relative w-full max-w-2xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="bg-brand-gradient flex size-10 items-center justify-center rounded-xl text-white shadow-sm">
              <Heart className="size-5" fill="currentColor" />
            </div>
            <span className="text-lg font-bold tracking-tight">Couple Growth</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold">
            Set up your couple space
          </h1>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Create a new space together, or join your partner with the
            invitation code they shared.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-sm font-semibold">Start a new couple</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              You can invite your partner right after.
            </p>
            <div className="mt-5">
              <CoupleSetupForm />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold">Join your partner</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter the invitation code they gave you.
            </p>
            <div className="mt-5">
              <JoinForm />
            </div>
          </Card>
        </div>

        <form action={logout} className="mt-8 text-center">
          <button
            type="submit"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
