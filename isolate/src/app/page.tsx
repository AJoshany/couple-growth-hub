import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Target,
  Trophy,
  BookOpen,
  Calendar,
  BarChart3,
  ShieldCheck,
  Heart,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Individual goals",
    description:
      "Set personal goals, track progress with milestones, and celebrate your growth.",
  },
  {
    icon: Trophy,
    title: "Shared goals",
    description: "Create goals together and build your future as a team.",
  },
  {
    icon: BookOpen,
    title: "Daily journal",
    description:
      "Log your days, track mood and energy, and discover your patterns.",
  },
  {
    icon: Calendar,
    title: "Dates & memories",
    description:
      "Plan dates, record memories, and never miss your next meeting.",
  },
  {
    icon: BarChart3,
    title: "Weekly review",
    description:
      "See your week at a glance with charts and meaningful insights.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description:
      "Sharing is your choice. Your data stays between you and your partner.",
  },
];

const pillars = [
  {
    icon: Sparkles,
    title: "Grow individually",
    copy: "Personal goals, milestones and daily reflections that help each of you become your best self.",
  },
  {
    icon: Heart,
    title: "Build together",
    copy: "Shared goals, dates and memories that turn two journeys into one story.",
  },
  {
    icon: Clock,
    title: "Remember everything",
    copy: "A living timeline of the moments, wins and milestones that define your relationship.",
  },
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-brand-gradient flex size-9 items-center justify-center rounded-xl text-white shadow-sm">
              <Heart className="size-4" fill="currentColor" />
            </div>
            <span className="text-base font-bold tracking-tight">
              Couple Growth
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth">
              <Button variant="ghost" className="h-9 px-3.5">
                Sign in
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="h-9 px-4">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-24 pt-20 text-center lg:px-8 lg:pt-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <Heart className="size-3 text-primary" fill="currentColor" />
              Built for two people growing together
            </span>

            <h1 className="mt-8 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Grow individually.
              <br />
              <span className="text-brand-gradient">Build together.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A private space to track your goals, share your days, plan your
              dates and remember the moments that matter — for two people who are
              intentional about their relationship.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Link href="/auth">
                <Button className="h-11 gap-2 px-7 text-base">
                  Start your journey
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#how">
                <Button variant="outline" className="h-11 px-7 text-base">
                  See how it works
                </Button>
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {["Free to use", "Private & secure", "No ads, ever"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section id="how" className="border-t border-border/60 bg-card/40">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight">
                One space for your whole relationship
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Individual growth and shared life, side by side.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-2xl border bg-card p-7 shadow-sm"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <pillar.icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {pillar.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border/60">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Everything you need to grow together
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
                A complete toolkit for building a stronger, more intentional
                relationship.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border bg-card p-7 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24 lg:px-8">
          <div className="bg-brand-gradient mx-auto max-w-5xl rounded-3xl px-6 py-16 text-center text-white shadow-lg sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to grow together?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/90 sm:text-lg">
              Start your journey today. It&apos;s free, private, and made for
              couples who want to be intentional about their relationship.
            </p>
            <Link href="/auth" className="mt-8 inline-block">
              <Button
                size="lg"
                className="h-11 gap-2 border-0 bg-white px-7 text-base text-primary hover:bg-white/90"
              >
                Get started — it&apos;s free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <div className="bg-brand-gradient flex size-6 items-center justify-center rounded-lg text-white">
              <Heart className="size-3" fill="currentColor" />
            </div>
            Couple Growth
          </div>
          <p>Built with care for couples who grow together.</p>
        </div>
      </footer>
    </div>
  );
}
