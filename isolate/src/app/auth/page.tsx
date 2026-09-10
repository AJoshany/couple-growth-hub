import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import Link from "next/link";

export default async function AuthPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden w-1/2 lg:flex lg:flex-col lg:items-center lg:justify-center bg-gradient-to-br from-rose-500 to-orange-400 p-12 text-white">
        <div className="max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="text-xl font-bold">Couple Growth Hub</span>
          </Link>
          <h2 className="text-3xl font-bold leading-tight">
            Grow individually.
            <br />
            Build together.
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Track goals, journal your days, and strengthen your relationship
            — all in one private space.
          </p>
          <div className="mt-12 space-y-4">
            {["Set and track personal goals", "Plan meaningful dates", "See your weekly progress"].map(
              (item) => (
                <div key={item} className="flex items-center gap-3 text-left">
                  <svg className="size-5 shrink-0 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  <span className="text-white/90">{item}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 text-white">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <span className="font-bold">Couple Growth Hub</span>
          </Link>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
