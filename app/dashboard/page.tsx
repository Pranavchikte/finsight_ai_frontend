"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionTable } from "@/components/transaction-table";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { SetIncomeModal } from "@/components/set-income-modal";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"; // <-- 1. Import the new component
import { Plus, TrendingDown, DollarSign, Loader2, Wallet } from "lucide-react";
import api from "@/lib/api";
import { Transaction, User } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [income, setIncome] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const [profileRes, transactionsRes, summaryRes] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/transactions/"),
          api.get("/transactions/summary"),
        ]);

        setUser(profileRes.data.data);
        setTransactions(transactionsRes.data.data);
        setIncome(profileRes.data.data.income || 0);
        setMonthlySpend(summaryRes.data.data.current_month_spend || 0);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    const processingTransactions = transactions.filter(t => t.status === 'processing');
    if (processingTransactions.length === 0) return;

    const interval = setInterval(async () => {
      const stillProcessing = transactions.filter(t => t.status === 'processing');
      
      for (const trans of stillProcessing) {
        try {
          const statusRes = await api.get(`/transactions/${trans._id}/status`);
          const { status } = statusRes.data.data;
          
          if (status === 'completed' || status === 'failed') {
            const finalTransRes = await api.get(`/transactions/${trans._id}`);
            const finalTransaction = finalTransRes.data.data;
            
            setTransactions(prev => 
              prev.map(t => t._id === finalTransaction._id ? finalTransaction : t)
            );

            if (finalTransaction.status === 'completed') {
              setMonthlySpend(prevSpend => prevSpend + finalTransaction.amount);
            }
          }
        } catch (err) {
          console.error(`Failed to poll status for transaction ${trans._id}`, err);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [transactions]);

  const handleIncomeUpdate = (newIncome: number) => {
    setIncome(newIncome);
    setIsIncomeModalOpen(false);
  };

  const handleTransactionAdded = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
    if (newTransaction.status === 'completed') {
      setMonthlySpend(prevSpend => prevSpend + newTransaction.amount);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const originalTransactions = [...transactions];
    const transactionToDelete = originalTransactions.find(t => t._id === transactionId);
    
    setTransactions(prev => prev.filter(t => t._id !== transactionId));
    if (transactionToDelete && transactionToDelete.status === 'completed') {
      setMonthlySpend(prevSpend => prevSpend - transactionToDelete.amount);
    }

    try {
      await api.delete(`/transactions/${transactionId}`);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      setTransactions(originalTransactions);
      if (transactionToDelete && transactionToDelete.status === 'completed') {
          setMonthlySpend(prevSpend => prevSpend + transactionToDelete.amount);
      }
    }
  };

  return (
    <DashboardLayout user={user}>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-destructive">{error}</div>
      ) : (
        <>
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
                
                {/* --- 2. THIS IS THE REPLACEMENT --- */}
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
                {/* --------------------------------- */}

              </CardContent>
            </Card>
          </div>

          {transactions.length > 0 ? (
            <TransactionTable transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No transactions yet. Add your first one!</p>
            </div>
          )}
          
          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl fab-button bg-primary hover:bg-primary/90"
          >
            <Plus className="h-7 w-7" />
          </Button>

          <AddExpenseModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            onTransactionAdded={handleTransactionAdded}
          />

          <SetIncomeModal 
            open={isIncomeModalOpen}
            onOpenChange={setIsIncomeModalOpen}
            currentIncome={income}
            onIncomeUpdate={handleIncomeUpdate}
          />
        </>
      )}
    </DashboardLayout>
  );
}