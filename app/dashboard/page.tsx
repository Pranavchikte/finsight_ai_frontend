"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionTable } from "@/components/transaction-table";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, DollarSign, Loader2, Wallet } from "lucide-react";
import api from "@/lib/api";
import { Transaction, User } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [userResponse, transactionsResponse] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/transactions/"),
        ]);
        
        setUser(userResponse.data.data);
        setTransactions(transactionsResponse.data.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Could not load dashboard data. Please try again.");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, [router]);

  useEffect(() => {
    const processingTransactions = transactions.filter(t => t.status === 'processing');
    if (processingTransactions.length === 0) return;

    const interval = setInterval(async () => {
      for (const trans of processingTransactions) {
        try {
          const statusRes = await api.get(`/transactions/${trans._id}/status`);
          const { status } = statusRes.data.data;
          
          if (status === 'completed' || status === 'failed') {
            const finalTransRes = await api.get(`/transactions/${trans._id}`);
            const finalTransaction = finalTransRes.data.data;
            
            setTransactions(prev => 
              prev.map(t => t._id === finalTransaction._id ? finalTransaction : t)
            );
          }
        } catch (err) {
          console.error(`Failed to poll status for transaction ${trans._id}`, err);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [transactions]);

  const handleTransactionAdded = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };
  
  const totalSpend = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t.status !== 'processing')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await api.delete(`/transactions/${transactionId}`);
      setTransactions(prev => prev.filter(t => t._id !== transactionId));
    } catch (err) {
      console.error("Failed to delete transaction:", err);
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8 animate-fade-in-up">
            <StatCard title="Total Spend (Month)" value={`₹${totalSpend.toFixed(2)}`} icon={DollarSign} />
            <StatCard title="Top Category" value="Groceries" icon={TrendingUp} />
            <StatCard title="Total Transactions" value={transactions.length.toString()} icon={Wallet} />
          </div>

          {transactions.length > 0 ? (
            <TransactionTable transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />
          ) : (
            <div className="text-center py-20">
              <div className="text-lg text-muted-foreground">No transactions yet. Add your first one!</div>
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
        </>
      )}
    </DashboardLayout>
  );
}