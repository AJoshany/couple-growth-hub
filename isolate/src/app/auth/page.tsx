import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { Heart, Sparkles, Target, Calendar, BookOpen, BarChart3 } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Target, text: "Set personal goals and track milestones" },
  { icon: Calendar, text: "Plan meaningful dates together" },
  { icon: BookOpen, text: "Journal your days and reflect" },
  { icon: BarChart3, text: "See your weekly progress" },
  { icon: Sparkles, text: "Save your favorite memories" },
];

export default async function AuthPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - branding */}
      <div className="bg-brand-gradient relative hidden w-1/2 overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-black/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 size-64 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />

        {/* Floating hearts (decorative) */}
        <div className="pointer-events-none absolute right-16 top-20 text-white/10">
          <Heart className="size-20" fill="currentColor" />
        </div>
        <div className="pointer-events-none absolute bottom-24 left-12 text-white/5">
          <Heart className="size-32" fill="currentColor" />
        </div>
        <div className="pointer-events-none absolute right-1/4 bottom-1/3 text-white/8">
          <Sparkles className="size-16" />
        </div>

        {/* Logo + Back link */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Heart className="size-6" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">Couple Growth</span>
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative z-10 mx-auto max-w-lg">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Grow individually.
            <br />
            <span className="text-white/70">Build together.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/80">
            A private space to set goals, journal your days, plan dates,
            and strengthen your relationship — for two people who are
            intentional about their journey.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 space-y-4">
            {features.map((item) => (
              <div key={item.text} className="flex items-center gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <item.icon className="size-4.5" />
                </div>
                <span className="text-white/90 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom social proof */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <div className="flex -space-x-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">A</div>
              <div className="flex size-7 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">S</div>
            </div>
            <span>Trusted by couples building stronger relationships</span>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="bg-brand-gradient flex size-10 items-center justify-center rounded-xl text-white shadow-sm">
            <Heart className="size-5" fill="currentColor" />
          </div>
          <span className="text-lg font-bold tracking-tight">Couple Growth</span>
        </Link>

        {/* Brand glow behind form area (mobile + desktop) */}
        <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-72 lg:hidden" />

        <div className="relative w-full max-w-sm">
          <Suspense>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
