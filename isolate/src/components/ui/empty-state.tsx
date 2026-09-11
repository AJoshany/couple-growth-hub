import { cn } from "cn";
import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

/**
 * Beautiful empty state component shown when a list has no items.
 * Uses a consistent design with icon, title, description, and optional CTA.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary/60">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && (
        <Link href={action.href} className="mt-6">
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  );
}

/**
 * Compact inline empty state for use within cards or sections.
 */
export function InlineEmptyState({
  icon: Icon,
  text,
  className,
}: {
  icon: LucideIcon;
  text: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-10 text-center",
        className
      )}
    >
      <Icon className="size-8 text-muted-foreground/40" />
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
