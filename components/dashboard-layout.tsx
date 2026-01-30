"use client";

import { useState, useEffect } from "react";
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
import { BarChart3, LayoutDashboard, LogOut, Plus, Menu, Receipt, Sparkles, Target, WifiOff } from "lucide-react";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { User, Transaction } from "@/lib/types";
import api, { getOfflineStatus } from "@/lib/api";
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
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(getOfflineStatus());

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
            "gap-3 justify-start w-full nav-item transition-all duration-200",
            pathname === "/dashboard"
              ? "text-foreground bg-muted/70 border-l-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="font-medium">Dashboard</span>
        </Button>
      </Link>

      <Link href="/transactions" passHref onClick={onClick}>
        <Button
          variant="ghost"
          className={cn(
            "gap-3 justify-start w-full nav-item transition-all duration-200",
            pathname === "/transactions"
              ? "text-foreground bg-muted/70 border-l-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <Receipt className="h-4 w-4" />
          <span className="font-medium">Transactions</span>
        </Button>
      </Link>

      <Link href="/history" passHref onClick={onClick}>
        <Button
          variant="ghost"
          className={cn(
            "gap-3 justify-start w-full nav-item transition-all duration-200",
            pathname === "/history"
              ? "text-foreground bg-muted/70 border-l-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="font-medium">History</span>
        </Button>
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Offline Indicator */}
      {isOffline && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2 animate-fade-in">
          <WifiOff className="h-4 w-4 animate-pulse" />
          You are offline. Some features may not work.
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/50 bg-card/95 backdrop-blur-xl px-4 md:px-8 shadow-sm">
        {/* Left: Mobile Menu + Logo + Desktop Nav */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Hamburger */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-muted/50 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-[280px] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50"
            >
              <SheetHeader className="border-b border-border/50 pb-4">
                <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col gap-1.5 mt-6">
                <NavLinks onClick={() => setIsSheetOpen(false)} />

                {/* Divider */}
                <div className="my-4 border-t border-border/50" />

                {/* AI Insights */}
                {onViewAiInsights && (
                  <Button
                    variant="ghost"
                    className="gap-3 justify-start w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    onClick={() => {
                      setIsSheetOpen(false);
                      onViewAiInsights();
                    }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai-accent/10">
                      <Sparkles className="h-4 w-4 text-ai-accent" />
                    </div>
                    <span className="font-medium">AI Insights</span>
                  </Button>
                )}

                {/* Monthly Budgets */}
                {onViewBudgets && (
                  <Button
                    variant="ghost"
                    className="gap-3 justify-start w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    onClick={() => {
                      setIsSheetOpen(false);
                      onViewBudgets();
                    }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">Monthly Budgets</span>
                  </Button>
                )}

                {/* Divider */}
                <div className="my-4 border-t border-border/50" />

                {/* Logout */}
                <Button
                  variant="ghost"
                  className="gap-3 justify-start w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  onClick={() => {
                    setIsSheetOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 group"
          >
            <h1 className="text-lg md:text-2xl font-bold tracking-tight text-foreground transition-colors">
              FinSight <span className="text-primary">AI</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLinks />
          </nav>
        </div>

        {/* Right: Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground btn-transition shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span className="font-semibold">Add Expense</span>
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l border-border/50">
            <div className="text-right">
              <p className="text-sm font-semibold capitalize text-foreground">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 transition-all hover:ring-primary/40">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Mobile: Avatar Only */}
        <div className="flex md:hidden items-center">
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Floating Action Button - Mobile */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground z-50 fab-button hover:shadow-2xl"
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