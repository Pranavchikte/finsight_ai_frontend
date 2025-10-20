"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SpendingBarChart } from "@/components/spending-bar-chart";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { User, Transaction } from "@/lib/types";

// Define the shape of the analytics report data
interface AnalyticsReport {
  startDate: string;
  endDate: string;
  totalSpendInRange: number;
  spendingByCategory: { category: string; total: number }[];
  spendingOverTime: { date: string; total: number }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reportData, setReportData] = useState<AnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches user profile and analytics data on component mount.
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile and analytics data in parallel
        const [userResponse, reportResponse] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/analytics/report"),
        ]);
        setUser(userResponse.data.data);
        setReportData(reportResponse.data.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        // Type-safe error handling
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || "Failed to load analytics. Please try again.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * This function is called when a new transaction is added via the modal.
   * It navigates the user to the main dashboard to see the updated list.
   */
  const handleTransactionAdded = (newTransaction: Transaction) => {
    console.log("Transaction added, navigating to dashboard:", newTransaction);
    router.push("/dashboard");
  };

  return (
    // The DashboardLayout now manages the user state and the "Add Expense" modal
    <DashboardLayout user={user} onTransactionAdded={handleTransactionAdded}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            A deep dive into your spending habits for the current month.
          </p>
        </div>

        {/* Content States: Loading, Error, or Data */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive bg-card p-8 rounded-lg">
            {error}
          </div>
        ) : reportData ? (
          <div
            className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Bar Chart - Spending Over Time */}
            <div className="lg:col-span-3">
              <SpendingBarChart data={reportData.spendingOverTime} />
            </div>

            {/* Pie Chart - Category Breakdown */}
            <div className="lg:col-span-2">
              <CategoryPieChart data={reportData.spendingByCategory} />
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}