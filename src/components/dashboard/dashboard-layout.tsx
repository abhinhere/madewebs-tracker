"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Activity,
  CalendarDays,
  Download,
  LayoutDashboard,
  PanelsTopLeft,
  Plus,
  Sparkles,
  Users,
  LogOut,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: PanelsTopLeft, adminOnly: true },
  { label: "Team", href: "/team", icon: Users, adminOnly: true },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Reports", href: "/reports", icon: Activity, adminOnly: true },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER";

  const filteredNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar p-4 lg:block">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">MadeWebs Tracker</p>
            <p className="text-xs text-muted-foreground">{isAdmin ? "Agency OS (Admin)" : "Employee Workspace"}</p>
          </div>
        </div>
        <nav className="mt-6 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  isActive && "bg-accent text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-border bg-background p-3 flex flex-col gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground truncate">{isAdmin ? "Admin access" : "Employee account"}</p>
            <p className="text-sm font-medium truncate mt-0.5">{session?.user?.email || "Signed In"}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-2 text-xs border-red-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
          >
            <LogOut className="h-3 w-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3 lg:px-7">
            <div className="lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold">MadeWebs Tracker</h1>
              <p className="truncate text-sm text-muted-foreground">Projects, payments, reviews, and team delivery in one workspace.</p>
            </div>
            {isAdmin && (
              <>
                <Button variant="outline" size="sm" onClick={() => { window.location.href = "/api/reports/export"; }}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Link href="/projects?new=true" className={buttonVariants({ size: "sm" })}>
                  <Plus className="h-4 w-4" />
                  New project
                </Link>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 space-y-6 px-4 py-6 lg:px-7">
          {children}
        </div>
      </main>
    </div>
  );
}
