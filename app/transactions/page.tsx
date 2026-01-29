"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionTable } from "@/components/transaction-table";
import { TransactionFilters } from "@/components/transaction-filters";
import { Receipt, Search } from "lucide-react";
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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      // FIX #38: Virtual scrolling via pagination (50 items per page)
      const res = await api.get("/transactions/", { 
        params: { ...filters, page, limit: 50 } 
      });
      
      const data = res.data.data;
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  const handleTransactionAdded = async (newTransaction: Transaction) => {
    setFilters({ search: "", category: "" });
    setPage(1);
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

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  return (
    <DashboardLayout user={user} onTransactionAdded={handleTransactionAdded}>
      <div className="space-y-6">
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

        <TransactionFilters onFilterChange={handleFilterChange} />

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
        ) : transactions.length > 0 ? (
          <>
            {/* FIX #38: Virtual scrolling via pagination */}
            <TransactionTable
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          /* FIX #41: Enhanced empty state */
          <div className="text-center py-20 bg-card/50 rounded-lg border border-border/50">
            <div className="max-w-md mx-auto space-y-6 px-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-foreground text-xl">
                  No transactions found
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or add a new transaction
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="mt-4"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}