"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/app/actions/couple";

export function AcceptInviteButton({ code }: { code: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleAccept() {
    setLoading(true);
    setError(null);
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
    <div className="space-y-4">
      <Button onClick={handleAccept} className="w-full" disabled={loading}>
        {loading ? "Joining..." : "Accept Invitation"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
