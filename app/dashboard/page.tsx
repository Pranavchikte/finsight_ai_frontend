"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionTable } from "@/components/transaction-table";
import { TransactionFilters } from "@/components/transaction-filters";
// AddExpenseModal is no longer imported or rendered here
import { SetIncomeModal } from "@/components/set-income-modal";
import { StatCard } from "@/components/stat-card";
import { BudgetList } from "@/components/budget-list";
import { AddBudgetModal } from "@/components/add-budget-modal";
import { AiSummaryCard } from "@/components/ai-summary-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { TrendingDown, DollarSign, Loader2, Wallet } from "lucide-react";
import api from "@/lib/api";
import { Transaction, User, Budget } from "@/lib/types";

/**
 * The main dashboard page for the application.
 * Displays user stats, budgets, AI summary, and a filterable transaction list.
 */
export default function DashboardPage() {
  const router = useRouter();
  
  // Note: state for the AddExpenseModal has been moved to DashboardLayout
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For the transaction list specifically
  const [isInitialLoading, setIsInitialLoading] = useState(true); // For the overall page

  const [income, setIncome] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const [filters, setFilters] = useState({ search: "", category: "" });

  // Fetches initial non-transaction data once on page load
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
        setIsInitialLoading(false);
      }
    };
    fetchInitialData();
  }, [router]);

  // Fetches transactions whenever filters change
  useEffect(() => {
    if (isInitialLoading) return;
    setIsLoading(true);
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/transactions/", { params: filters });
        setTransactions(res.data.data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [filters, isInitialLoading]);
  
  // This polling logic remains the same
  useEffect(() => {
    const processingTransactions = transactions.filter(t => t.status === 'processing');
    if (processingTransactions.length === 0) return;
    const interval = setInterval(() => {
      processingTransactions.forEach(async (trans) => {
        try {
          const statusRes = await api.get(`/transactions/${trans._id}/status`);
          const { status } = statusRes.data.data;
          if (status === 'completed' || status === 'failed') {
            const finalTransRes = await api.get(`/transactions/${trans._id}`);
            const finalTransaction = finalTransRes.data.data;
            setTransactions(prev => prev.map(t => t._id === finalTransaction._id ? finalTransaction : t));
            if (finalTransaction.status === 'completed') {
              setMonthlySpend(prevSpend => prevSpend + finalTransaction.amount);
              api.get("/budgets/").then(res => setBudgets(res.data.data));
            }
          }
        } catch (err) {
          console.error(`Failed to poll status for transaction ${trans._id}`, err);
          setTransactions(prev => prev.map(t => t._id === trans._id ? { ...t, status: 'failed' } : t));
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [transactions]);

  /**
   * Callback for when a new transaction is added from the modal.
   * Passed up to DashboardLayout.
   */
  const handleTransactionAdded = (newTransaction: Transaction) => {
    setFilters({ search: "", category: "" });
    if (newTransaction.status === 'completed') {
      api.get("/transactions/summary").then(res => setMonthlySpend(res.data.data.current_month_spend));
      api.get("/budgets/").then(res => setBudgets(res.data.data));
    }
  };

  const handleIncomeUpdate = (newIncome: number) => { setIncome(newIncome); setIsIncomeModalOpen(false); };
  
  const handleDeleteTransaction = async (transactionId: string) => {
    const originalTransactions = [...transactions];
    setTransactions(prev => prev.filter(t => t._id !== transactionId));
    try {
      await api.delete(`/transactions/${transactionId}`);
      api.get("/transactions/summary").then(res => setMonthlySpend(res.data.data.current_month_spend));
      api.get("/budgets/").then(res => setBudgets(res.data.data));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      setTransactions(originalTransactions);
    }
  };

  const handleBudgetAdded = (newBudget: Budget) => { api.get("/budgets/").then(res => setBudgets(res.data.data)); setIsBudgetModalOpen(false); };

  return (
    <DashboardLayout user={user} onTransactionAdded={handleTransactionAdded}>
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

          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <TransactionFilters onFilterChange={setFilters} />
            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-card/50 rounded-lg"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : transactions.length > 0 ? (
              <TransactionTable transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />
            ) : (
              <div className="text-center py-20 bg-card/50 rounded-lg"><p className="text-lg text-muted-foreground">No transactions found for the selected filters.</p></div>
            )}
          </div>
          
          {/* The AddExpenseModal is no longer rendered here */}
          
          <SetIncomeModal open={isIncomeModalOpen} onOpenChange={setIsIncomeModalOpen} currentIncome={income} onIncomeUpdate={handleIncomeUpdate} />
          <AddBudgetModal open={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen} onBudgetAdded={handleBudgetAdded} />
        </>
      )}
    </DashboardLayout>
  );
}