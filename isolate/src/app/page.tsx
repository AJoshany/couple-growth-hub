import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-sm">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">Couple Growth Hub</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth">
            <Button variant="ghost" className="font-medium">Sign in</Button>
          </Link>
          <Link href="/auth">
            <Button className="font-medium bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white border-0 shadow-sm">
              Get started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="relative flex flex-1 flex-col items-center justify-center px-6 pt-12 pb-24 text-center">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-rose-100/60 to-transparent blur-3xl" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-rose-600 shadow-sm backdrop-blur">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Built for couples who grow together
          </div>

          <h1 className="mt-8 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Grow individually.
            <br />
            <span className="bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent">
              Build together.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Track your personal goals, share your journey, and strengthen your
            relationship — all in one private space built for two people who
            are growing together.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/auth">
              <Button size="lg" className="px-10 py-6 text-base font-semibold bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white border-0 shadow-md">
                Start your journey — it&apos;s free
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <svg className="size-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              Free to use
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="size-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              Private & secure
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="size-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              No ads, ever
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-white/50 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">Everything you need to grow together</h2>
              <p className="mt-3 text-lg text-muted-foreground">
                A complete toolkit for building a stronger, more intentional relationship.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "🎯",
                  title: "Individual Goals",
                  description:
                    "Set personal goals, track progress with milestones, and celebrate your growth.",
                },
                {
                  icon: "🤝",
                  title: "Shared Goals",
                  description:
                    "Create goals together and build your future as a team.",
                },
                {
                  icon: "📝",
                  title: "Daily Journal",
                  description:
                    "Log your days, track mood and energy, and discover your patterns.",
                },
                {
                  icon: "💕",
                  title: "Date Planning",
                  description:
                    "Plan dates, record memories, and never miss your next meeting.",
                },
                {
                  icon: "📊",
                  title: "Weekly Review",
                  description:
                    "See your week at a glance with charts and meaningful insights.",
                },
                {
                  icon: "🔒",
                  title: "Private & Secure",
                  description:
                    "Your data stays between you and your partner. Always.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border bg-white p-7 transition-all hover:shadow-lg hover:shadow-rose-100/50"
                >
                  <div className="text-3xl">{feature.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 text-center">
          <div className="mx-auto max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight">Ready to grow together?</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Start your journey today. It&apos;s free, private, and built for couples
              who want to be intentional about their relationship.
            </p>
            <Link href="/auth" className="mt-8 inline-block">
              <Button size="lg" className="px-10 py-6 text-base font-semibold bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white border-0 shadow-md">
                Get started — it&apos;s free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>Built with care for couples who grow together.</p>
      </footer>
    </div>
  );
}
