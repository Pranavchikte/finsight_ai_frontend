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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingDown,
  DollarSign,
  Loader2,
  Wallet,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Transaction, User, Budget } from "@/lib/types";

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

  // Mobile collapse states
  const [showBudgets, setShowBudgets] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);

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
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data");
        router.push("/");
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
      setTransactions(res.data.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [isInitialLoading]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const processingTransactions = transactions.filter(
      (t) => t.status === "processing",
    );
    if (processingTransactions.length === 0) return;

    const interval = setInterval(() => {
      processingTransactions.forEach(async (trans) => {
        if (
          transactions.find((t) => t._id === trans._id)?.status !== "processing"
        )
          return;

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
              api
                .get("/transactions/summary")
                .then((res) =>
                  setMonthlySpend(res.data.data.current_month_spend),
                );
              api.get("/budgets/").then((res) => setBudgets(res.data.data));
            } else if (finalTransaction.status === "failed") {
              toast.error("AI processing failed. Please try again.");
            }
          }
        } catch (err) {
          console.error(
            `Failed to poll status for transaction ${trans._id}`,
            err,
          );
          setTransactions((prev) =>
            prev.map((t) =>
              t._id === trans._id ? { ...t, status: "failed" } : t,
            ),
          );
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [transactions]);

  const handleTransactionAdded = (newTransaction: Transaction) => {
    if (newTransaction.status !== "processing") {
      setTransactions((prev) => [newTransaction, ...prev]);
    }
    if (newTransaction.status === "completed") {
      api
        .get("/transactions/summary")
        .then((res) => setMonthlySpend(res.data.data.current_month_spend));
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
      api
        .get("/transactions/summary")
        .then((res) => setMonthlySpend(res.data.data.current_month_spend));
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

  return (
    <DashboardLayout user={user} onTransactionAdded={handleTransactionAdded}>
      {isInitialLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats - Mobile: 2 cards, Desktop: 3 cards */}
          <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3 mb-6 md:mb-8 animate-fade-in-up">
            <StatCard
              title="Remaining Balance"
              value={`₹${(income - monthlySpend).toFixed(2)}`}
              icon={Wallet}
              variant={income - monthlySpend < 0 ? "warning" : "success"}
            />
            <StatCard
              title="Current Month Spend"
              value={`₹${monthlySpend.toFixed(2)}`}
              icon={TrendingDown}
            />
            {/* Income Card - Hidden on mobile, shown on desktop */}
            <Card className="hidden md:block hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Income
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{income.toFixed(2)}</div>
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
          </div>

          {/* Income Prompt for New Users */}
          {income === 0 && (
            <div className="mb-6 md:mb-8 animate-fade-in-up">
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        Set Your Monthly Income
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Add your monthly income to track your remaining balance
                        and spending limits
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsIncomeModalOpen(true)}
                      className="w-full md:w-auto"
                    >
                      Set Income Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Summary - Collapsible on mobile */}
          <div
            className="mb-6 md:mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="md:hidden mb-2">
              <Button
                variant="ghost"
                onClick={() => setShowAiSummary(!showAiSummary)}
                className="w-full justify-between text-base font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  AI Insights
                </span>
                {showAiSummary ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className={`${showAiSummary ? "block" : "hidden"} md:block`}>
              <AiSummaryCard />
            </div>
          </div>

          {/* Budgets - Collapsible on mobile */}
          <div
            className="mb-6 md:mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="md:hidden mb-2">
              <Button
                variant="ghost"
                onClick={() => setShowBudgets(!showBudgets)}
                className="w-full justify-between text-base font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Monthly Budgets
                </span>
                {showBudgets ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className={`${showBudgets ? "block" : "hidden"} md:block`}>
              <BudgetList
                budgets={budgets}
                onAddBudget={() => setIsBudgetModalOpen(true)}
              />
            </div>
          </div>

          {/* Transactions - Only 5 Recent */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
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

            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-card/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transactions.length > 0 ? (
              <TransactionTable
                transactions={transactions.slice(0, 5)}
                onDeleteTransaction={handleDeleteTransaction}
              />
            ) : (
              <div className="text-center py-12 bg-card/50 rounded-lg border border-border/50">
                <div className="max-w-md mx-auto space-y-6 px-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg mb-2">
                      No transactions yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Start tracking your expenses to see them here
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-accent/20 rounded-lg p-4 border border-border/30">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-foreground mb-1">
                            AI Powered
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Just describe your expense naturally and AI will
                            categorize it
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-accent/20 rounded-lg p-4 border border-border/30">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-foreground mb-1">
                            Manual Entry
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Enter amount, category, and description yourself
                          </p>
                        </div>
                      </div>
                    </div>
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
        </>
      )}
    </DashboardLayout>
  );
}
