"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionTable } from "@/components/transaction-table";
import { SetIncomeModal } from "@/components/set-income-modal";
import { StatCard } from "@/components/stat-card";
import { BudgetList } from "@/components/budget-list";
import { AddBudgetModal } from "@/components/add-budget-modal";
import { AiSummaryCard } from "@/components/ai-summary-card";
import { ErrorBanner } from "@/components/error-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingDown,
  DollarSign,
  Wallet,
  Sparkles,
  Target,
} from "lucide-react";
import {
  StatCardSkeleton,
  TransactionCardSkeleton,
  TransactionTableSkeleton,
  BudgetSkeleton,
  AISummarySkeleton,
} from "@/components/skeletons";
import { toast } from "sonner";
import api from "@/lib/api";
import { Transaction, User, Budget } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency, formatCurrencyWithSign } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [income, setIncome] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [showAiModal, setShowAiModal] = useState(false);
  const [showBudgetsModal, setShowBudgetsModal] = useState(false);

  // FIX #42: Consistent loading states
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [profileRes, summaryRes, budgetsRes] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/transactions/summary"),
          api.get("/budgets/"),
        ]);
        setUser(profileRes.data.data);
        setIncome(profileRes.data.data.income || 0);
        setMonthlySpend(summaryRes.data.data.current_month_spend || 0);
        setBudgets(budgetsRes.data.data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError("Failed to load dashboard data. Please check your connection and try again.");
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchInitialData();
  }, [router]);

  const fetchTransactions = useCallback(async () => {
    if (isInitialLoading) return;

    setIsLoading(true);
    try {
      const res = await api.get("/transactions/");
      setTransactions(res.data.data.transactions || []);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isInitialLoading]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (!Array.isArray(transactions)) return;

    const processingTransactions = transactions.filter((t) => t.status === "processing");
    if (processingTransactions.length === 0) return;

    const interval = setInterval(() => {
      processingTransactions.forEach(async (trans) => {
        if (transactions.find((t) => t._id === trans._id)?.status !== "processing") return;

        try {
          const statusRes = await api.get(`/transactions/${trans._id}/status`);
          const { status } = statusRes.data.data;

          if (status === "completed" || status === "failed") {
            const finalTransRes = await api.get(`/transactions/${trans._id}`);
            const finalTransaction = finalTransRes.data.data;

            setTransactions((prevTransactions) =>
              prevTransactions.map((t) =>
                t._id === finalTransaction._id ? finalTransaction : t,
              ),
            );

            if (finalTransaction.status === "completed") {
              toast.success("AI processing complete!");
              api.get("/transactions/summary").then((res) => setMonthlySpend(res.data.data.current_month_spend));
              api.get("/budgets/").then((res) => setBudgets(res.data.data));
            } else if (finalTransaction.status === "failed") {
              toast.error("AI processing failed. Please try again.");
            }
          }
        } catch (err) {
          console.error(`Failed to poll status for transaction ${trans._id}`, err);
          setTransactions((prev) =>
            prev.map((t) =>
              t._id === trans._id ? { ...t, status: "failed" } : t,
            ),
          );
        }
      });
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [transactions]);

  const handleTransactionAdded = (newTransaction: Transaction) => {
    if (newTransaction.status !== "processing") {
      setTransactions((prev) => [newTransaction, ...prev]);
    }
    if (newTransaction.status === "completed") {
      api.get("/transactions/summary").then((res) => setMonthlySpend(res.data.data.current_month_spend));
      api.get("/budgets/").then((res) => setBudgets(res.data.data));
    } else {
      setTimeout(() => fetchTransactions(), 500);
    }
  };

  const handleIncomeUpdate = (newIncome: number) => {
    setIncome(newIncome);
    setIsIncomeModalOpen(false);
    toast.success("Income updated successfully!");
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const originalTransactions = [...transactions];
    setTransactions((prev) => prev.filter((t) => t._id !== transactionId));

    try {
      await api.delete(`/transactions/${transactionId}`);
      toast.success("Transaction deleted successfully!");
      api.get("/transactions/summary").then((res) => setMonthlySpend(res.data.data.current_month_spend));
      api.get("/budgets/").then((res) => setBudgets(res.data.data));
    } catch (error) {
      console.error("Failed to delete transaction");
      toast.error("Failed to delete transaction");
      setTransactions(originalTransactions);
    }
  };

  const handleBudgetAdded = (newBudget: Budget) => {
    api.get("/budgets/").then((res) => setBudgets(res.data.data));
    setIsBudgetModalOpen(false);
    toast.success("Budget created successfully!");
  };

  // FIX #40: Consistent currency formatting
  const balance = income - monthlySpend;

  return (
    <DashboardLayout
      user={user}
      onTransactionAdded={handleTransactionAdded}
      onViewAiInsights={() => setShowAiModal(true)}
      onViewBudgets={() => setShowBudgetsModal(true)}
    >
      {/* FIX #42: Consistent loading states */}
      {isInitialLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <div className="hidden md:block">
              <StatCardSkeleton />
            </div>
          </div>
          <AISummarySkeleton />
          <BudgetSkeleton />
          <div className="hidden md:block">
            <TransactionTableSkeleton />
          </div>
          <div className="md:hidden space-y-3">
            <TransactionCardSkeleton />
            <TransactionCardSkeleton />
            <TransactionCardSkeleton />
          </div>
        </div>
      ) : (
        <>
          {error && (
            <ErrorBanner
              message={error}
              onRetry={() => {
                setError(null);
                setIsInitialLoading(true);
                window.location.reload();
              }}
              onDismiss={() => setError(null)}
            />
          )}

          <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3 mb-6 md:mb-8 animate-fade-in-up">
            <Card className="hover:shadow-md transition-all duration-200 border-blue-500/30 bg-blue-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Income
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                {/* FIX #40: Consistent currency formatting */}
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(income)}
                </div>
                <Button
                  onClick={() => setIsIncomeModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 text-xs"
                >
                  Update Income
                </Button>
              </CardContent>
            </Card>

            <StatCard
              title="Remaining Balance"
              value={formatCurrencyWithSign(balance)}
              icon={Wallet}
              variant={balance < 0 ? "warning" : "success"}
            />

            <StatCard
              title="Current Month Spend"
              value={formatCurrency(monthlySpend)}
              icon={TrendingDown}
              variant="warning"
            />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Recent Activity
              </h2>
              {transactions.length > 0 && (
                <Link href="/transactions">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              )}
            </div>

            {/* FIX #42: Consistent loading state */}
            {isLoading ? (
              <>
                <div className="hidden md:block">
                  <TransactionTableSkeleton />
                </div>
                <div className="md:hidden space-y-3">
                  <TransactionCardSkeleton />
                  <TransactionCardSkeleton />
                  <TransactionCardSkeleton />
                </div>
              </>
            ) : Array.isArray(transactions) && transactions.length > 0 ? (
              <TransactionTable
                transactions={transactions.slice(0, 5)}
                onDeleteTransaction={handleDeleteTransaction}
              />
            ) : (
              /* FIX #41: Enhanced empty state */
              <div className="text-center py-16 bg-card/50 rounded-lg border border-border/50">
                <div className="max-w-md mx-auto space-y-6 px-4">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                      <DollarSign className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-foreground text-xl">
                      No transactions yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Start tracking your expenses by adding your first transaction
                    </p>
                  </div>
                  <div className="bg-accent/30 rounded-lg p-4 text-left space-y-2 border border-border/50">
                    <p className="text-sm font-semibold text-foreground">
                      💡 Get Started
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Use the "Add Expense" button to manually add transactions or let AI parse them for you
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <SetIncomeModal
            open={isIncomeModalOpen}
            onOpenChange={setIsIncomeModalOpen}
            currentIncome={income}
            onIncomeUpdate={handleIncomeUpdate}
          />
          <AddBudgetModal
            open={isBudgetModalOpen}
            onOpenChange={setIsBudgetModalOpen}
            onBudgetAdded={handleBudgetAdded}
          />

          <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Insights
                </DialogTitle>
              </DialogHeader>
              <AiSummaryCard />
            </DialogContent>
          </Dialog>

          <Dialog open={showBudgetsModal} onOpenChange={setShowBudgetsModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Monthly Budgets
                </DialogTitle>
              </DialogHeader>
              <BudgetList
                budgets={budgets}
                onAddBudget={() => {
                  setShowBudgetsModal(false);
                  setIsBudgetModalOpen(true);
                }}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </DashboardLayout>
  );
}