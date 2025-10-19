"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SpendingBarChart } from "@/components/spending-bar-chart";
import { CategoryPieChart } from "@/components/category-pie-chart"; // <-- 1. Import the new component
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { User } from "@/lib/types";

// Define the type for our report data for type safety
interface AnalyticsReport {
  startDate: string;
  endDate: string;
  totalSpendInRange: number;
  spendingByCategory: { category: string; total: number }[];
  spendingOverTime: { date: string; total: number }[];
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reportData, setReportData] = useState<AnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch analytics data:", err);
        setError(err.response?.data?.data?.message || "Could not load analytics data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            A deep dive into your spending habits for the current month.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive bg-card p-8 rounded-lg">{error}</div>
        ) : reportData ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="lg:col-span-3">
              <SpendingBarChart data={reportData.spendingOverTime} />
            </div>
            <div className="lg:col-span-2">
              {/* --- 2. Replace the placeholder --- */}
              <CategoryPieChart data={reportData.spendingByCategory} />
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}