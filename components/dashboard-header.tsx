// components/dashboard-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { User } from "@/lib/types";

interface DashboardHeaderProps {
  user: User | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/");
  };

  // --- Dynamic Data Logic ---
  const userName = user ? user.email.split('@')[0] : "User";
  const userInitials = user ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <header className="h-20 bg-card/50 backdrop-blur-sm border-b border-border flex items-center justify-end px-8">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            {/* Display dynamic user name, capitalized */}
            <p className="text-sm font-semibold text-foreground capitalize">{userName}</p>
            {/* "Premium User" text is now removed */}
          </div>
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            {/* Display dynamic user initials */}
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