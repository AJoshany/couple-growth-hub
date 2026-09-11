"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { register } from "@/app/actions/auth";

type Mode = "login" | "register";

/**
 * Submit a native login POST to Auth.js.
 * Using a real form submission (rather than fetch) lets the browser handle
 * Set-Cookie and the 302 redirect natively — the same path curl uses.
 */
function submitNativeLogin(
  csrfToken: string,
  email: string,
  password: string,
  callbackUrl: string,
) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/auth/callback/credentials";

  const fields: Record<string, string> = {
    csrfToken,
    email,
    password,
    callbackUrl,
  };

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [csrfToken, setCsrfToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  // Fetch CSRF token on mount so the browser stores the matching cookie
  useEffect(() => {
    fetch("/api/auth/csrf", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => setCsrfToken(data.csrfToken ?? ""))
      .catch(() => setCsrfToken(""));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!csrfToken) {
      setErrors({ email: ["Still preparing sign-in, please try again."] });
      return;
    }

    if (mode === "register") {
      const name = (form.elements.namedItem("name") as HTMLInputElement).value;
      const formData = new FormData();
      formData.set("name", name);
      formData.set("email", email);
      formData.set("password", password);

      setLoading(true);
      try {
        const result = await register(formData);
        if (result?.error) {
          setErrors(result.error as Record<string, string[]>);
          setLoading(false);
          return;
        }
      } catch {
        // ignore — account was likely created
      }
      setLoading(false);
    } else {
      setLoading(true);
    }

    // Native form POST — browser sets the session cookie and follows the redirect
    submitNativeLogin(csrfToken, email, password, returnTo);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
          <Heart className="size-6 text-primary" fill="currentColor" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "login" ? "Welcome back" : "Join your partner"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {mode === "login"
            ? "Sign in to your shared space"
            : "Create your account and start growing together"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Name
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                className="h-11 pl-10"
                required
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name[0]}</p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="h-11 pl-10"
              required
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              className="h-11 pl-10"
              required
              minLength={8}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password[0]}</p>
          )}
        </div>
        <Button
          type="submit"
          className="bg-brand-gradient h-11 w-full border-0 text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/20"
          disabled={loading || !csrfToken}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 animate-spin" /> Please wait...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {mode === "login" ? "Sign in" : "Create account"}
              <ArrowRight className="size-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => {
                setMode("register");
                setErrors({});
              }}
              className="font-medium text-primary hover:opacity-80"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => {
                setMode("login");
                setErrors({});
              }}
              className="font-medium text-primary hover:opacity-80"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
