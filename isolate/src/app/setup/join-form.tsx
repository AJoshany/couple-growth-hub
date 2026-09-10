"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptInvitation } from "@/app/actions/couple";

export function JoinForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const code = formData.get("code") as string;
    try {
      const result = await acceptInvitation(code);
      if (result?.error) {
        setError(
          typeof result.error === "object"
            ? Object.values(result.error).flat().join(", ")
            : result.error
        );
      }
    } catch (e) {
      if (e instanceof Error && e.message === "NEXT_REDIRECT") {
        router.refresh();
        return;
      }
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-code">Invitation Code</Label>
        <Input
          id="invite-code"
          name="code"
          placeholder="Paste your code here"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Joining..." : "Join Couple"}
      </Button>
    </form>
  );
}
