"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/app/actions/auth";

type Mode = "login" | "register";

/**
 * Submit a native login POST to Auth.js.
 * Using a real form submission (rather than fetch) lets the browser handle
 * Set-Cookie and the 302 redirect natively — the same path curl uses.
 */
function submitNativeLogin(csrfToken: string, email: string, password: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/auth/callback/credentials";

  const fields: Record<string, string> = {
    csrfToken,
    email,
    password,
    callbackUrl: "/dashboard",
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
    submitNativeLogin(csrfToken, email, password);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {mode === "login"
            ? "Sign in to continue your journey"
            : "Start growing together"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              className="h-11"
              required
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name[0]}</p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="h-11"
            required
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="h-11"
            required
            minLength={8}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password[0]}</p>
          )}
        </div>
        <Button
          type="submit"
          className="h-11 w-full text-base font-semibold bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white border-0"
          disabled={loading || !csrfToken}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => {
                setMode("register");
                setErrors({});
              }}
              className="font-medium text-rose-600 hover:text-rose-500"
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
              className="font-medium text-rose-600 hover:text-rose-500"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
