"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionTable } from "@/components/transaction-table";
import { TransactionFilters } from "@/components/transaction-filters"; // <-- 1. Import new component
import { AddExpenseModal } from "@/components/add-expense-modal";
import { SetIncomeModal } from "@/components/set-income-modal";
import { StatCard } from "@/components/stat-card";
import { BudgetList } from "@/components/budget-list";
import { AddBudgetModal } from "@/components/add-budget-modal";
import { AiSummaryCard } from "@/components/ai-summary-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Plus, TrendingDown, DollarSign, Loader2, Wallet } from "lucide-react";
import api from "@/lib/api";
import { Transaction, User, Budget } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false); // For AddExpenseModal
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Now primarily for the transaction list
  const [isInitialLoading, setIsInitialLoading] = useState(true); // For the overall page

  const [income, setIncome] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // --- 2. State for filters ---
  const [filters, setFilters] = useState({ search: "", category: "" });

  // --- 3. Refactored Initial Data Fetch ---
  // This effect now only fetches non-transaction data once.
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
        router.push("/");
      } finally {
        setIsInitialLoading(false); // Mark initial page load as complete
      }
    };
    fetchInitialData();
  }, [router]);

  // --- 4. New useEffect to fetch transactions based on filters ---
  useEffect(() => {
    // Don't fetch transactions until the initial page data is loaded
    if (isInitialLoading) return; 

    setIsLoading(true); // Show loader for the transaction list
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/transactions/", {
          params: filters,
        });
        setTransactions(res.data.data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false); // Hide loader for the transaction list
      }
    };
    fetchTransactions();
  }, [filters, isInitialLoading]); // Re-runs when filters or initial load status change

  // ... (Polling useEffect and handler functions remain the same) ...
  const handleIncomeUpdate = (newIncome: number) => {
    setIncome(newIncome);
    setIsIncomeModalOpen(false);
  };
  const handleTransactionAdded = (newTransaction: Transaction) => {
    // To see the new transaction immediately, we can reset filters or just add it to the list
    setFilters({ search: "", category: "" }); // Easiest way to refetch and show the new item
  };
  const handleDeleteTransaction = async (transactionId: string) => {
    // This logic can be simplified now that the list refetches
    const originalTransactions = [...transactions];
    setTransactions(prev => prev.filter(t => t._id !== transactionId)); // Optimistic UI
    try {
      await api.delete(`/transactions/${transactionId}`);
      // Re-fetch related data
      api.get("/transactions/summary").then(res => setMonthlySpend(res.data.data.current_month_spend));
      api.get("/budgets/").then(res => setBudgets(res.data.data));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      setTransactions(originalTransactions); // Revert on failure
    }
  };
  const handleBudgetAdded = (newBudget: Budget) => {
    api.get("/budgets/").then(res => setBudgets(res.data.data));
    setIsBudgetModalOpen(false);
  };


  return (
    <DashboardLayout user={user}>
      {isInitialLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8 animate-fade-in-up">
            <StatCard title="Remaining Balance" value={`₹${(income - monthlySpend).toFixed(2)}`} icon={Wallet}/>
            <StatCard title="Current Month Spend" value={`₹${monthlySpend.toFixed(2)}`} icon={TrendingDown}/>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{income.toFixed(2)}</div>
                <div className="mt-2 flex justify-center">
                  <HoverBorderGradient containerClassName="rounded-md w-full" as="button" className="dark:bg-black bg-white text-black dark:text-white flex items-center justify-center w-full py-2 px-4" onClick={() => setIsIncomeModalOpen(true)}>
                    <span className="text-sm font-semibold">Update Income</span>
                  </HoverBorderGradient>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}><AiSummaryCard /></div>
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}><BudgetList budgets={budgets} onAddBudget={() => setIsBudgetModalOpen(true)} /></div>

          {/* --- 5. Add TransactionFilters and updated loading/empty states --- */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <TransactionFilters onFilterChange={setFilters} />
            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-card/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transactions.length > 0 ? (
              <TransactionTable transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />
            ) : (
              <div className="text-center py-20 bg-card/50 rounded-lg">
                <p className="text-lg text-muted-foreground">No transactions found for the selected filters.</p>
              </div>
            )}
          </div>
          
          <Button size="lg" onClick={() => setIsModalOpen(true)} className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl fab-button bg-primary hover:bg-primary/90">
            <Plus className="h-7 w-7" />
          </Button>

          <AddExpenseModal open={isModalOpen} onOpenChange={setIsModalOpen} onTransactionAdded={handleTransactionAdded} />
          <SetIncomeModal open={isIncomeModalOpen} onOpenChange={setIsIncomeModalOpen} currentIncome={income} onIncomeUpdate={handleIncomeUpdate} />
          <AddBudgetModal open={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen} onBudgetAdded={handleBudgetAdded} />
        </>
      )}
    </DashboardLayout>
  );
}