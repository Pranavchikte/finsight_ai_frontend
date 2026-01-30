"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionTable } from "@/components/transaction-table";
import { TransactionFilters } from "@/components/transaction-filters";
import { Receipt, Search, ArrowLeft } from "lucide-react";
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
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                All Transactions
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all your expense records
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Filters */}
        <TransactionFilters onFilterChange={handleFilterChange} />

        {/* Content */}
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
          <div className="space-y-6">
            <TransactionTable
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="min-w-[100px]"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-sm font-medium text-foreground">
                    {page}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    of
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="min-w-[100px]"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Enhanced Empty State */
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg">
            <div className="text-center py-20 space-y-6 px-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-foreground text-xl">
                  No transactions found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {filters.search || filters.category 
                    ? "Try adjusting your filters or search terms"
                    : "Start adding transactions to see them here"
                  }
                </p>
              </div>
              
              <div className="flex gap-3 justify-center pt-2">
                {(filters.search || filters.category) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({ search: "", category: "" });
                      setPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
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