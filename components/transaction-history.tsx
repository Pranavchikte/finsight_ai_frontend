"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Receipt,
  Loader2,
} from "lucide-react";
import { Transaction } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils"; // ADDED: Import formatDate utility
import { Skeleton } from "@/components/ui/skeleton";

interface DayGroup {
  date: string;
  total_spend: number;
  transaction_count: number;
  transactions: Transaction[];
}

interface TransactionHistoryProps {
  historyData: DayGroup[];
  isLoading: boolean;
  selectedMonth: number;
  selectedYear: number;
  onMonthYearChange: (month: number, year: number) => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function TransactionHistory({
  historyData,
  isLoading,
  selectedMonth,
  selectedYear,
  onMonthYearChange,
}: TransactionHistoryProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  // CHANGED: Use standardized date formatting with timezone conversion (FIX #31, #32)
  const formatDayGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Compare dates only (ignore time)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
    }
    if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Yesterday";
    }
    // Use standardized short format (FIX #32)
    return formatDate(dateString, 'short');
  };

  // CHANGED: Use standardized time formatting (FIX #31, #32)
  const formatTransactionTime = (dateString: string) => {
    return formatDate(dateString, 'time');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Transaction History
          </h1>
        </div>

        {/* Month/Year Selector */}
        <div className="flex items-center gap-3">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) =>
              onMonthYearChange(parseInt(value), selectedYear)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(value) =>
              onMonthYearChange(selectedMonth, parseInt(value))
            }
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : historyData.length === 0 ? (
        /* Empty state */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              No transactions in {MONTHS[selectedMonth]} {selectedYear}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try selecting a different month or start tracking expenses
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Transaction list */
        <div className="space-y-4">
          {historyData.map((dayGroup, index) => {
            const isExpanded = expandedDays.has(dayGroup.date);

            return (
              <Card
                key={dayGroup.date}
                className="overflow-hidden transition-all duration-200 hover:shadow-md animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader
                  className="cursor-pointer hover:bg-accent/30 transition-all duration-200 active:scale-[0.99]"
                  onClick={() => toggleDay(dayGroup.date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        {/* CHANGED: Use standardized date formatting (FIX #31, #32) */}
                        <CardTitle className="text-lg font-semibold">
                          {formatDayGroupDate(dayGroup.date)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {dayGroup.transaction_count} transaction
                          {dayGroup.transaction_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-destructive">
                          ₹{dayGroup.total_spend.toFixed(2)}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-accent/50 flex items-center justify-center">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-3">
                      {dayGroup.transactions.map((transaction) => (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50 hover:bg-accent/30 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-semibold text-foreground">
                                {transaction.description}
                              </p>
                              {/* CHANGED: Use standardized time formatting (FIX #31, #32) */}
                              <p className="text-sm text-muted-foreground">
                                {formatTransactionTime(transaction.date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="font-medium">
                              {transaction.category}
                            </Badge>
                            <p className="text-lg font-bold text-destructive min-w-[100px] text-right">
                              ₹{transaction.amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}