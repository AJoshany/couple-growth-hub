import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, LinkIcon, Clock } from "lucide-react";
import Link from "next/link";
import { AcceptInviteButton } from "./accept-button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth?returnTo=/auth/invite/${code}`);
  }

  const invitation = await prisma.invitation.findUnique({
    where: { code },
    include: { sender: { select: { name: true } } },
  });

  if (!invitation || invitation.status !== "PENDING") {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
        <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-72" />
        <Card className="relative w-full max-w-md text-center">
          <CardContent className="pt-8 space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
              <LinkIcon className="size-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Invalid Invitation</h1>
              <p className="mt-2 text-muted-foreground">
                This invitation link is invalid or has already been used.
              </p>
            </div>
            <Link href="/dashboard">
              <Button className="bg-brand-gradient border-0 text-white hover:opacity-90">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (new Date() > invitation.expiresAt) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
        <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-72" />
        <Card className="relative w-full max-w-md text-center">
          <CardContent className="pt-8 space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Clock className="size-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Invitation Expired</h1>
              <p className="mt-2 text-muted-foreground">
                This invitation has expired. Ask your partner to generate a new one.
              </p>
            </div>
            <Link href="/dashboard">
              <Button className="bg-brand-gradient border-0 text-white hover:opacity-90">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-72" />
      <Card className="relative w-full max-w-md text-center">
        <CardContent className="pt-8 space-y-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="size-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Join Your Partner</h1>
            <p className="mt-2 text-muted-foreground">
              <span className="font-semibold text-foreground">
                {invitation.sender?.name ?? "Someone"}
              </span>{' '}
              has invited you to start your journey together on Couple Growth.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-brand-gradient flex size-10 items-center justify-center rounded-full text-white shadow-sm">
              <Heart className="size-5" fill="currentColor" />
            </div>
          </div>
          <AcceptInviteButton code={code} />
        </CardContent>
      </Card>
    </div>
  );
}
