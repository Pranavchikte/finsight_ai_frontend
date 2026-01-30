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
  Tag,
  Clock,
} from "lucide-react";
import { Transaction } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
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
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

  const formatDayGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
    }
    if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Yesterday";
    }
    return formatDate(dateString, 'short');
  };

  const formatTransactionTime = (dateString: string) => {
    return formatDate(dateString, 'time');
  };

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("food"))
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (categoryLower.includes("transport"))
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (categoryLower.includes("shop"))
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (categoryLower.includes("entertainment"))
      return "bg-pink-500/10 text-pink-500 border-pink-500/20";
    if (categoryLower.includes("utilities"))
      return "bg-success/10 text-success border-success/20";
    if (categoryLower.includes("health"))
      return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20";
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Transaction History
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View transactions grouped by day
            </p>
          </div>
        </div>

        {/* Month/Year Selector */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) =>
              onMonthYearChange(parseInt(value), selectedYear)
            }
          >
            <SelectTrigger className="w-[140px] h-10 bg-muted/50 border-border/50">
              <SelectValue placeholder="Month" />
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
            <SelectTrigger className="w-[100px] h-10 bg-muted/50 border-border/50">
              <SelectValue placeholder="Year" />
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

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-border/50 bg-card/80">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-24 bg-muted/50" />
                    <Skeleton className="h-4 w-32 bg-muted/50" />
                  </div>
                  <Skeleton className="h-8 w-32 bg-muted/50" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : historyData.length === 0 ? (
        /* Empty State */
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No transactions found
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              No transactions in {MONTHS[selectedMonth]} {selectedYear}. Try selecting a different month or start tracking expenses.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Transaction List */
        <div className="space-y-3">
          {historyData.map((dayGroup, index) => {
            const isExpanded = expandedDays.has(dayGroup.date);

            return (
              <Card
                key={dayGroup.date}
                className={cn(
                  "overflow-hidden transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-md animate-fade-in-up",
                  `animate-stagger-${Math.min(index + 1, 5)}`
                )}
              >
                <CardHeader
                  className="cursor-pointer hover:bg-muted/30 transition-all duration-200 p-5"
                  onClick={() => toggleDay(dayGroup.date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-foreground">
                          {formatDayGroupDate(dayGroup.date)}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {dayGroup.transaction_count} transaction{dayGroup.transaction_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-destructive tabular-nums">
                          ₹{dayGroup.total_spend.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4 px-5 animate-fade-in">
                    <div className="space-y-2">
                      {dayGroup.transactions.map((transaction) => (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-border/50 transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm truncate">
                              {transaction.description}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTransactionTime(transaction.date)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 ml-4">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "font-medium text-xs gap-1 whitespace-nowrap",
                                getCategoryColor(transaction.category)
                              )}
                            >
                              <Tag className="h-3 w-3" />
                              {transaction.category}
                            </Badge>
                            <p className="text-base font-bold text-destructive tabular-nums min-w-[100px] text-right">
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