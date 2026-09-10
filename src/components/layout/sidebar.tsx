"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Users,
  BookOpen,
  Heart,
  Calendar,
  Sparkles,
  Trophy,
  BarChart3,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/partner", label: "Partner", icon: Users },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/goals", label: "My Goals", icon: Target },
      { href: "/shared-goals", label: "Shared Goals", icon: Trophy },
      { href: "/journal", label: "Journal", icon: BookOpen },
      { href: "/weekly", label: "Weekly Review", icon: BarChart3 },
    ],
  },
  {
    label: "Together",
    items: [
      { href: "/relationship", label: "Relationship", icon: Heart },
      { href: "/dates", label: "Dates", icon: Calendar },
      { href: "/memories", label: "Memories", icon: Sparkles },
      { href: "/timeline", label: "Timeline", icon: Clock },
    ],
  },
];

interface SidebarProps {
  user: {
    name: string;
    email: string;
    partnerName: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="bg-brand-gradient flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
          <Heart className="size-4" fill="currentColor" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">Couple Growth</p>
          <p className="truncate text-[11px] text-muted-foreground">
            Grow individually. Build together.
          </p>
        </div>
      </div>

      <nav className="scrollbar-slim flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                      )}
                    >
                      {isActive && (
                        <span className="bg-brand-gradient absolute inset-y-1.5 -left-3 w-1 rounded-r-full" />
                      )}
                      <item.icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground/80 group-hover:text-foreground"
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent",
            pathname.startsWith("/settings") && "bg-primary/10"
          )}
        >
          <div className="bg-brand-gradient flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.partnerName ? `with ${user.partnerName}` : user.email}
            </p>
          </div>
          <Settings className="size-4 shrink-0 text-muted-foreground/70" />
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
