"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { TransactionTable } from "@/components/transaction-table";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, DollarSign, Loader2, Wallet } from "lucide-react";
import api from "@/lib/api";
import { Transaction, User } from "@/lib/types";

export default function DashboardPage() {
  // State for the UI
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for data
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Fetch all necessary data when the component mounts
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [userResponse, transactionsResponse] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/transactions/")
        ]);
        
        setUser(userResponse.data);
        setTransactions(transactionsResponse.data);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  const handleTransactionAdded = () => {
    api.get("/transactions/").then(response => setTransactions(response.data));
  };

  const handleTransactionDeleted = async (transactionId: string) => {
    try {
      await api.delete(`/transactions/${transactionId}`);
      setTransactions((prev) => prev.filter((t) => t._id !== transactionId));
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    }
  };

  // --- Calculate Total Spend using useMemo for efficiency ---
  const totalSpend = useMemo(() => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  return (
    <div className="bg-background dark">
      <div className="flex min-h-screen">
        <DashboardSidebar 
          isCollapsed={isSidebarCollapsed} 
          toggleSidebar={toggleSidebar} 
        />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          <main className="flex-1 p-8 relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-destructive">
                {error}
              </div>
            ) : (
              <div className="space-y-8">
                {/* --- Stat Card Display Section --- */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard 
                    title="Total Spend" 
                    value={`₹${totalSpend.toFixed(2)}`}
                    icon={Wallet} 
                  />
                  {/* You can add more StatCards here in the future */}
                </div>

                {transactions.length > 0 ? (
                  <TransactionTable
                    transactions={transactions}
                    onDeleteTransaction={handleTransactionDeleted}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[50vh]">
                    <div className="text-center max-w-md animate-fade-in-up">
                      <div className="flex justify-center mb-8">
                        <div className="relative">
                          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <TrendingUp className="h-12 w-12 text-primary" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-accent" />
                          </div>
                        </div>
                      </div>
                      <h2 className="text-4xl font-bold text-foreground mb-4 tracking-tight">Welcome to FinSight AI!</h2>
                      <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        No transactions yet. Add your first expense to begin.
                      </p>
                      <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Your First Expense
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <Button
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl fab-button animate-pulse-glow bg-primary hover:bg-primary/90"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </main>
        </div>
      </div>
      <AddExpenseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
}
