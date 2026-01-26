"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionHistory } from "@/components/transaction-history";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { User, Transaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface DayGroup {
  date: string;
  total_spend: number;
  transaction_count: number;
  transactions: Transaction[];
}

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [historyData, setHistoryData] = useState<DayGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for selected month/year
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await api.get("/auth/profile");
        setUser(profileRes.data.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        router.push("/");
      }
    };
    fetchProfile();
  }, [router]);

  // Fetch history whenever month/year changes
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // Calculate start and end dates for the selected month
        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(
          selectedYear,
          selectedMonth + 1,
          0,
          23,
          59,
          59,
        );

        const historyRes = await api.get("/transactions/history", {
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        });
        setHistoryData(historyRes.data.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [selectedMonth, selectedYear, user]);

  const handleTransactionAdded = async (newTransaction: Transaction) => {
    // Refetch history after adding transaction
    try {
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

      const historyRes = await api.get("/transactions/history", {
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        },
      });
      setHistoryData(historyRes.data.data);
    } catch (error) {
      console.error("Failed to refresh history:", error);
    }
  };

  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <DashboardLayout user={user} onTransactionAdded={handleTransactionAdded}>
      {!user ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <TransactionHistory
          historyData={historyData}
          isLoading={isLoading}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthYearChange={handleMonthYearChange}
        />
      )}
    </DashboardLayout>
  );
}
