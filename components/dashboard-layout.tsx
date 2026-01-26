"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BarChart3, LayoutDashboard, LogOut, Plus, Menu, Receipt, Sparkles, Target, DollarSign } from "lucide-react";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { User, Transaction } from "@/lib/types";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  user: User | null;
  children: React.ReactNode;
  onTransactionAdded: (newTransaction: Transaction) => void;
  onViewAiInsights?: () => void;
  onViewBudgets?: () => void;
}

export function DashboardLayout({
  user,
  children,
  onTransactionAdded,
  onViewAiInsights,
  onViewBudgets,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const userName = user ? user.email.split("@")[0] : "User";
  const userInitials = user ? user.email.substring(0, 2).toUpperCase() : "U";

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      <Link href="/dashboard" passHref onClick={onClick}>
        <Button
          variant="ghost"
          className={cn(
            "gap-2 justify-start hover:text-foreground w-full",
            pathname === "/dashboard"
              ? "text-foreground bg-accent"
              : "text-muted-foreground",
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Button>
      </Link>

      <Link href="/transactions" passHref onClick={onClick}>
        <Button
          variant="ghost"
          className={cn(
            "gap-2 justify-start hover:text-foreground w-full",
            pathname === "/transactions"
              ? "text-foreground bg-accent"
              : "text-muted-foreground",
          )}
        >
          <Receipt className="h-4 w-4" />
          Transactions
        </Button>
      </Link>

      <Link href="/history" passHref onClick={onClick}>
        <Button
          variant="ghost"
          className={cn(
            "gap-2 justify-start hover:text-foreground w-full",
            pathname === "/history"
              ? "text-foreground bg-accent"
              : "text-muted-foreground",
          )}
        >
          <BarChart3 className="h-4 w-4" />
          History
        </Button>
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-4 md:px-8 backdrop-blur-sm sticky top-0 z-50">
        {/* Mobile: Hamburger + Logo */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Hamburger Menu - Mobile Only */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                <NavLinks onClick={() => setIsSheetOpen(false)} />

                {/* AI Insights - Mobile Only */}
                {onViewAiInsights && (
                  <Button
                    variant="ghost"
                    className="gap-2 justify-start hover:text-foreground w-full mt-4 border-t border-border pt-4"
                    onClick={() => {
                      setIsSheetOpen(false);
                      onViewAiInsights();
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Insights
                  </Button>
                )}

                {/* Monthly Budgets - Mobile Only */}
                {onViewBudgets && (
                  <Button
                    variant="ghost"
                    className="gap-2 justify-start hover:text-foreground w-full"
                    onClick={() => {
                      setIsSheetOpen(false);
                      onViewBudgets();
                    }}
                  >
                    <Target className="h-4 w-4 text-primary" />
                    Monthly Budgets
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="gap-2 justify-start text-muted-foreground hover:text-destructive w-full mt-4 border-t border-border pt-4"
                  onClick={() => {
                    setIsSheetOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-lg md:text-2xl font-bold tracking-tight text-foreground"
          >
            FinSight AI
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLinks />
          </nav>
        </div>

        {/* Right side: Desktop Add Expense + User + Logout */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-semibold">Add Expense</span>
          </Button>

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

        {/* Mobile: Just Avatar */}
        <div className="flex md:hidden items-center">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">{children}</main>

      {/* Floating Action Button - Mobile Only */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onTransactionAdded={onTransactionAdded}
      />
    </div>
  );
}
