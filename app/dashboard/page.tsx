"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionTable } from "@/components/transaction-table";
import { SetIncomeModal } from "@/components/set-income-modal";
import { LinkWhatsAppModal, WhatsAppStatusBadge } from "@/components/link-whatsapp-modal";
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
  ArrowRight,
  MessageCircle,
  CheckCircle2,
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

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [showAiModal, setShowAiModal] = useState(false);
  const [showBudgetsModal, setShowBudgetsModal] = useState(false);

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
        setWhatsappVerified(profileRes.data.data.whatsapp_verified || false);
        setWhatsappNumber(profileRes.data.data.whatsapp_number || "");
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

  const balance = income - monthlySpend;

  return (
    <DashboardLayout
      user={user}
      onTransactionAdded={handleTransactionAdded}
      onViewAiInsights={() => setShowAiModal(true)}
      onViewBudgets={() => setShowBudgetsModal(true)}
    >
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

          {/* Stats Section with Quick Actions */}
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3 animate-fade-in-up">
              {/* Income Card */}
              <Card className="relative overflow-hidden transition-all duration-300 ease-out group card-hover border-border/50 bg-card/80 backdrop-blur-sm">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-transparent" />
                
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    Monthly Income
                  </CardTitle>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-3">
                  <div className="text-3xl font-bold tracking-tight text-foreground transition-all duration-200 group-hover:scale-105">
                    {formatCurrency(income)}
                  </div>
                  <Button
                    onClick={() => setIsIncomeModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  >
                    Update Income
                  </Button>
                </CardContent>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
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

            {/* Quick Actions - Mobile & Desktop */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWhatsAppModalOpen(true)}
                className={`gap-2 border-green-500/30 text-xs sm:text-sm ${whatsappVerified ? 'text-green-600 bg-green-50 dark:bg-green-950' : 'text-muted-foreground hover:text-green-600 hover:bg-green-50 hover:border-green-500/50'} transition-all`}
              >
                {whatsappVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">WhatsApp Linked</span>
                    <span className="sm:hidden">Linked</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Link WhatsApp</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAiModal(true)}
                className="gap-2 border-ai-accent/30 text-xs sm:text-sm text-muted-foreground hover:text-ai-accent hover:bg-ai-accent/10 hover:border-ai-accent/50 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Insights</span>
                <span className="sm:hidden">AI</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBudgetsModal(true)}
                className="gap-2 border-primary/30 text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Monthly Budgets</span>
                <span className="sm:hidden">Budgets</span>
              </Button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Recent Activity
              </h2>
              {transactions.length > 0 && (
                <Link href="/transactions">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="group gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              )}
            </div>

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
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="py-16">
                  <div className="max-w-md mx-auto space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                          <DollarSign className="h-10 w-10 text-primary" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-bold text-foreground text-xl">
                        No transactions yet
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Start tracking your expenses by adding your first transaction
                      </p>
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-4 text-left space-y-2 border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-sm font-semibold text-foreground">
                          Getting Started
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Use the "Add Expense" button to manually add transactions or let AI parse them for you
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Modals */}
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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-border/50 bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai-accent/10">
                    <Sparkles className="h-4 w-4 text-ai-accent" />
                  </div>
                  <span className="text-xl font-bold">AI Insights</span>
                </DialogTitle>
              </DialogHeader>
              <AiSummaryCard />
            </DialogContent>
          </Dialog>

          <Dialog open={showBudgetsModal} onOpenChange={setShowBudgetsModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-border/50 bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xl font-bold">Monthly Budgets</span>
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

          <LinkWhatsAppModal
            open={isWhatsAppModalOpen}
            onOpenChange={setIsWhatsAppModalOpen}
            currentWhatsAppNumber={whatsappNumber}
            isVerified={whatsappVerified}
            onVerified={() => {
              setWhatsappVerified(true);
              api.get("/auth/profile").then((res) => {
                setWhatsappVerified(res.data.data.whatsapp_verified || false);
                setWhatsappNumber(res.data.data.whatsapp_number || "");
              });
            }}
          />
        </>
      )}
    </DashboardLayout>
  );
}