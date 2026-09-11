"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  BookOpen,
  Heart,
  Menu,
  Users,
  Trophy,
  BarChart3,
  Calendar,
  Sparkles,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logout } from "@/app/actions/auth";

const primaryItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/relationship", label: "Us", icon: Heart },
];

const moreSections = [
  {
    label: "Overview",
    items: [
      { href: "/partner", label: "Partner Progress", icon: Users },
      { href: "/weekly", label: "Weekly Review", icon: BarChart3 },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/shared-goals", label: "Shared Goals", icon: Trophy },
      { href: "/goals", label: "My Goals", icon: Target },
      { href: "/journal", label: "Journal", icon: BookOpen },
    ],
  },
  {
    label: "Together",
    items: [
      { href: "/dates", label: "Dates", icon: Calendar },
      { href: "/memories", label: "Memories", icon: Sparkles },
      { href: "/timeline", label: "Timeline", icon: Clock },
    ],
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
      <ul className="grid grid-cols-5">
        {primaryItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                "flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                open ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Menu className="size-5" />
              More
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="scrollbar-slim max-h-[80vh] overflow-y-auto rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+1rem)]"
            >
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-4">
                {moreSections.map((section) => (
                  <div key={section.label}>
                    <p className="pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                      {section.label}
                    </p>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                              isActive(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <item.icon className="size-4" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive("/settings")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Settings className="size-4" />
                    Settings
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
