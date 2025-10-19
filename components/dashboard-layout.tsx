"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BarChart3, LayoutDashboard, LogOut } from "lucide-react";
import { User } from "@/lib/types";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  user: User | null;
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname(); // Hook to get the current URL path

  const handleLogout = async () => {
    try {
      await api.delete("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/");
    }
  };

  const userName = user ? user.email.split('@')[0] : "User";
  const userInitials = user ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Unified Header Navbar */}
      <header className="flex h-20 items-center justify-between border-b border-border bg-card/50 px-8 backdrop-blur-sm sticky top-0 z-50">
        {/* Left Side: Logo and Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight text-foreground">
            FinSight AI
          </Link>
          <nav className="flex items-center gap-2">
            
            {/* --- FIX 1: Wrapped Dashboard button in a Link --- */}
            <Link href="/dashboard" passHref>
              <Button
                variant="ghost"
                className={cn(
                  "gap-2 justify-start hover:text-foreground",
                  pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>

            {/* --- FIX 2: Wrapped Analytics button in a Link --- */}
            <Link href="/analytics" passHref>
              <Button
                variant="ghost"
                className={cn(
                  "gap-2 justify-start hover:text-foreground",
                  pathname === "/analytics" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>

          </nav>
        </div>

        {/* Right Side: User Profile and Logout */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold capitalize text-foreground">
                {userName}
              </p>
            </div>
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}