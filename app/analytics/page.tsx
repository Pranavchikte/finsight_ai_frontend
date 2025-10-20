"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Router for navigation after transaction add
import { DashboardLayout } from "@/components/dashboard-layout";
import { SpendingBarChart } from "@/components/spending-bar-chart";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { User, Transaction } from "@/lib/types"; // 2. Transaction type for handler

interface AnalyticsReport {
  startDate: string;
  endDate: string;
  totalSpendInRange: number;
  spendingByCategory: { category: string; total: number }[];
  spendingOverTime: { date: string; total: number }[];
}

export default function AnalyticsPage() {
  const router = useRouter(); // 3. Router instance for navigation
  const [user, setUser] = useState<User | null>(null);
  const [reportData, setReportData] = useState<AnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches user profile and analytics data on component mount
   * - User profile for dashboard layout
   * - Analytics report for charts and visualization
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [profileRes, analyticsRes] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/analytics/report"),
        ]);
        setUser(profileRes.data.data);
        setReportData(analyticsRes.data.data);
      } catch (err: any) {
        console.error("Failed to fetch analytics data:", err);
        setError(err.response?.data?.data?.message || "Could not load analytics data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * 4. Handler for when a transaction is added from this page
   * Redirects to dashboard where the new transaction can be viewed
   * Dashboard will handle data refresh automatically
   */
  const handleTransactionAdded = (newTransaction: Transaction) => {
    // Redirect to dashboard to see the newly added transaction
    router.push("/dashboard");
  };

  return (
    // 5. Pass transaction handler to layout - modal is managed there
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
            style={{ animationDelay: '0.2s' }}
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