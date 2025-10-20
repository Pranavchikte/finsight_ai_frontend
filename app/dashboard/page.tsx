"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionTable } from "@/components/transaction-table";
import { TransactionFilters } from "@/components/transaction-filters";
// 1. AddExpenseModal import removed - now managed in DashboardLayout
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

export default function DashboardPage() {
  const router = useRouter();
  
  // 2. isModalOpen state removed - modal state now managed in DashboardLayout
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [income, setIncome] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const [filters, setFilters] = useState({ search: "", category: "" });

  /**
   * Fetches initial dashboard data on component mount
   * - User profile (including income)
   * - Monthly spend summary
   * - Budget list
   */
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

  /**
   * Fetches transactions based on current filters
   * Only runs after initial loading is complete
   */
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

  /**
   * Polls for status updates on processing transactions
   * - Checks every 3 seconds
   * - Updates transaction status when completed or failed
   * - Refreshes monthly spend and budgets on completion
   */
  useEffect(() => {
    const processingTransactions = transactions.filter(t => t.status === 'processing');
    if (processingTransactions.length === 0) {
      return; // No active polling needed
    }

    const interval = setInterval(() => {
      processingTransactions.forEach(async (trans) => {
        try {
          const statusRes = await api.get(`/transactions/${trans._id}/status`);
          const { status } = statusRes.data.data;
          
          if (status === 'completed' || status === 'failed') {
            const finalTransRes = await api.get(`/transactions/${trans._id}`);
            const finalTransaction = finalTransRes.data.data;
            
            setTransactions(prevTransactions => 
              prevTransactions.map(t => t._id === finalTransaction._id ? finalTransaction : t)
            );

            if (finalTransaction.status === 'completed') {
              setMonthlySpend(prevSpend => prevSpend + finalTransaction.amount);
              api.get("/budgets/").then(res => setBudgets(res.data.data));
            }
          }
        } catch (err) {
          // Stops polling for a specific transaction if it fails, preventing spam
          console.error(`Failed to poll status for transaction ${trans._id}`, err);
          setTransactions(prev => prev.map(t => t._id === trans._id ? { ...t, status: 'failed' } : t));
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [transactions]);

  /**
   * Handles income update from SetIncomeModal
   * Updates local state and closes modal
   */
  const handleIncomeUpdate = (newIncome: number) => {
    setIncome(newIncome);
    setIsIncomeModalOpen(false);
  };

  /**
   * 3. Callback for when a new transaction is added via AddExpenseModal
   * This is passed to DashboardLayout which manages the modal
   * - Resets filters to ensure new transaction is visible
   * - Refreshes monthly spend and budgets if transaction is completed
   */
  const handleTransactionAdded = (newTransaction: Transaction) => {
    // Reset filters to show the new transaction
    setFilters({ search: "", category: "" });
    
    // If transaction is already completed, update summary data
    if (newTransaction.status === 'completed') {
      api.get("/transactions/summary").then(res => 
        setMonthlySpend(res.data.data.current_month_spend)
      );
      api.get("/budgets/").then(res => 
        setBudgets(res.data.data)
      );
    }
  };

  /**
   * Handles transaction deletion
   * - Optimistically updates UI
   * - Reverts on API failure
   * - Refreshes summary data on success
   */
  const handleDeleteTransaction = async (transactionId: string) => {
    const originalTransactions = [...transactions];
    setTransactions(prev => prev.filter(t => t._id !== transactionId));
    
    try {
      await api.delete(`/transactions/${transactionId}`);
      api.get("/transactions/summary").then(res => 
        setMonthlySpend(res.data.data.current_month_spend)
      );
      api.get("/budgets/").then(res => 
        setBudgets(res.data.data)
      );
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      setTransactions(originalTransactions);
    }
  };

  /**
   * Handles budget addition
   * Refreshes budget list and closes modal
   */
  const handleBudgetAdded = (newBudget: Budget) => {
    api.get("/budgets/").then(res => setBudgets(res.data.data));
    setIsBudgetModalOpen(false);
  };

  return (
    // 4. Pass onTransactionAdded callback to DashboardLayout
    // Layout manages the AddExpenseModal and calls this when transaction is added
    <DashboardLayout user={user} onTransactionAdded={handleTransactionAdded}>
      {isInitialLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8 animate-fade-in-up">
            <StatCard 
              title="Remaining Balance" 
              value={`₹${(income - monthlySpend).toFixed(2)}`} 
              icon={Wallet}
            />
            <StatCard 
              title="Current Month Spend" 
              value={`₹${monthlySpend.toFixed(2)}`} 
              icon={TrendingDown}
            />
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{income.toFixed(2)}</div>
                <div className="mt-2 flex justify-center">
                  <HoverBorderGradient 
                    containerClassName="rounded-md w-full" 
                    as="button" 
                    className="dark:bg-black bg-white text-black dark:text-white flex items-center justify-center w-full py-2 px-4" 
                    onClick={() => setIsIncomeModalOpen(true)}
                  >
                    <span className="text-sm font-semibold">Update Income</span>
                  </HoverBorderGradient>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Summary Section */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <AiSummaryCard />
          </div>

          {/* Budget List Section */}
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <BudgetList budgets={budgets} onAddBudget={() => setIsBudgetModalOpen(true)} />
          </div>

          {/* Transactions Section */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <TransactionFilters onFilterChange={setFilters} />
            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-card/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transactions.length > 0 ? (
              <TransactionTable 
                transactions={transactions} 
                onDeleteTransaction={handleDeleteTransaction} 
              />
            ) : (
              <div className="text-center py-20 bg-card/50 rounded-lg">
                <p className="text-lg text-muted-foreground">
                  No transactions found for the selected filters.
                </p>
              </div>
            )}
          </div>
          
          {/* 5. AddExpenseModal removed from here - now rendered in DashboardLayout */}
          
          {/* Other Modals */}
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