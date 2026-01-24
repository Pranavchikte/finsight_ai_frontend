"use client";

import { useState } from "react"; // 1. Import useState for modal state management
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { BarChart3, LayoutDashboard, LogOut, Plus } from "lucide-react";
import { AddExpenseModal } from "@/components/add-expense-modal"; // 2. Import the modal component
import { User, Transaction } from "@/lib/types";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  user: User | null;
  children: React.ReactNode;
  onTransactionAdded: (newTransaction: Transaction) => void; // 3. Callback for when transaction is added
}

export function DashboardLayout({
  user,
  children,
  onTransactionAdded,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  // 4. State to control modal visibility - managed within this component
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Handles user logout
   * - Calls logout API endpoint
   * - Clears authentication tokens from localStorage
   * - Redirects to home page
   */
  const handleLogout = async () => {
    try {
      await api.delete("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear tokens regardless of API call success
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/");
    }
  };

  // Extract user display information from email
  const userName = user ? user.email.split("@")[0] : "User";
  const userInitials = user ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with navigation and user controls */}
      <header className="flex h-20 items-center justify-between border-b border-border bg-card/50 px-8 backdrop-blur-sm sticky top-0 z-50">
        {/* Left side: Logo and navigation links */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            FinSight AI
          </Link>

          <nav className="flex items-center gap-2">
            {/* Dashboard link with active state styling */}
            <Link href="/dashboard" passHref>
              <Button
                variant="ghost"
                className={cn(
                  "gap-2 justify-start hover:text-foreground",
                  pathname === "/dashboard"
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>

            {/* History link with active state styling */}
            <Link href="/history" passHref>
              <Button
                variant="ghost"
                className={cn(
                  "gap-2 justify-start hover:text-foreground",
                  pathname === "/history"
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <BarChart3 className="h-4 w-4" />
                History
              </Button>
            </Link>
          </nav>
        </div>

        {/* Right side: Add Expense button, user avatar, and logout */}
        <div className="flex items-center gap-4">
          {/* 5. Add Expense button that opens the modal */}
          <HoverBorderGradient
            containerClassName="rounded-md"
            as="button"
            className="dark:bg-black bg-white text-black dark:text-white flex items-center gap-2 px-4 py-2"
            onClick={() => setIsModalOpen(true)} // Open modal on click
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-semibold">Add Expense</span>
          </HoverBorderGradient>

          {/* User profile section */}
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

          {/* Logout button */}
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

      {/* Main content area */}
      <main className="flex-1 p-8">{children}</main>

      {/* 6. Modal component rendered within the layout
          - Controlled by isModalOpen state
          - Calls onTransactionAdded callback when transaction is successfully added
      */}
      <AddExpenseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onTransactionAdded={onTransactionAdded}
      />
    </div>
  );
}
