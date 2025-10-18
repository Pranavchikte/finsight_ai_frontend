"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { User } from "@/lib/types";
import api from "@/lib/api"; // <-- 1. Import the api instance

interface DashboardHeaderProps {
  user: User | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();

  // --- 2. Update the handleLogout function ---
  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint to invalidate the token.
      await api.delete("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
      // We proceed with client-side logout even if the server call fails.
    } finally {
      // Clear both tokens from storage and redirect.
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/");
    }
  };
  // ------------------------------------------

  const userName = user ? user.email.split('@')[0] : "User";
  const userInitials = user ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <header className="h-20 bg-card/50 backdrop-blur-sm border-b border-border flex items-center justify-end px-8">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground capitalize">{userName}</p>
          </div>
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}