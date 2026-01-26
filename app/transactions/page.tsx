"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionTable } from "@/components/transaction-table";
import { TransactionFilters } from "@/components/transaction-filters";
import { Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Transaction, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  TransactionTableSkeleton,
  TransactionCardSkeleton,
} from "@/components/skeletons";


export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<any>({ search: "", category: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profileRes = await api.get("/auth/profile");
        setUser(profileRes.data.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/");
      }
    };
    fetchUser();
  }, [router]);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/transactions/", { params: filters });
      setTransactions(res.data.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  const handleTransactionAdded = async (newTransaction: Transaction) => {
    setFilters({ search: "", category: "" });
    fetchTransactions();
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const originalTransactions = [...transactions];
    setTransactions((prev) => prev.filter((t) => t._id !== transactionId));

    try {
      await api.delete(`/transactions/${transactionId}`);
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      console.error("Failed to delete transaction");
      toast.error("Failed to delete transaction");
      setTransactions(originalTransactions);
    }
  };

  return (
    <DashboardLayout user={user} onTransactionAdded={handleTransactionAdded}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Receipt className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              All Transactions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all your expense records
            </p>
          </div>
        </div>

        {/* Filters */}
        <TransactionFilters onFilterChange={setFilters} />

        {/* Transactions List */}
        {isLoading ? (
          <>
            <div className="hidden md:block">
              <TransactionTableSkeleton />
            </div>
            <div className="md:hidden space-y-3">
              <TransactionCardSkeleton />
              <TransactionCardSkeleton />
              <TransactionCardSkeleton />
              <TransactionCardSkeleton />
              <TransactionCardSkeleton />
            </div>
          </>
        ) : transactions.length > 0 ? (
          <TransactionTable
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
          />
        ) : (
          <div className="text-center py-20 bg-card/50 rounded-lg border border-border/50">
            <div className="max-w-md mx-auto space-y-4 px-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg mb-2">
                  No transactions found
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or add your first expense
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
