"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Budget } from "@/lib/types";
import { PlusCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";
// FIX #11: Import currency utility
import { formatCurrency } from "@/lib/utils";

interface BudgetListProps {
  budgets: Budget[];
  onAddBudget: () => void;
}

export function BudgetList({ budgets, onAddBudget }: BudgetListProps) {
  const getProgressColor = (value: number) => {
    if (value > 90) return "bg-destructive";
    if (value > 70) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
        <CardTitle className="text-xl font-bold text-card-foreground">
          Monthly Budgets
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddBudget}
          className="text-primary hover:text-primary/80"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {budgets.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg mb-2">
                No budgets set yet
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Set spending limits to track your expenses better
              </p>
            </div>
            <div className="bg-accent/30 rounded-lg p-4 text-left space-y-2 max-w-sm mx-auto">
              <p className="text-xs font-semibold text-foreground">
                💡 Example:
              </p>
              <p className="text-xs text-muted-foreground">
                Set ₹5,000 for "Food & Dining" to control restaurant spending
              </p>
            </div>
            <Button onClick={onAddBudget} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Budget
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {budgets.map((budget) => {
              const percentage =
                budget.limit > 0
                  ? (budget.current_spend / budget.limit) * 100
                  : 0;
              
              // FIX #11: Using formatCurrency for all display values
              const spent = formatCurrency(budget.current_spend);
              const limit = formatCurrency(budget.limit);
              const remainingValue = Math.abs(budget.limit - budget.current_spend);
              const remaining = formatCurrency(remainingValue);
              
              const isOverBudget = budget.current_spend > budget.limit;

              return (
                <div key={budget._id}>
                  <div className="mb-2 flex justify-between items-baseline">
                    <span className="font-semibold text-card-foreground">
                      {budget.category}
                    </span>
                    <div className="text-right">
                      <span className={cn(
                        "text-sm font-bold",
                        isOverBudget && "text-destructive",
                        !isOverBudget && percentage > 90 && "text-destructive",
                        !isOverBudget && percentage > 70 && percentage <= 90 && "text-yellow-500",
                        percentage <= 70 && "text-muted-foreground"
                      )}>
                        {Math.min(percentage, 999).toFixed(0)}%
                        {percentage > 100 && (
                          <span className="text-xs ml-1">({(percentage - 100).toFixed(0)}% over)</span>
                        )}
                      </span>
                      <span
                        className={`text-xs ml-2 ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        {isOverBudget
                          ? `${remaining} over`
                          : `${remaining} left`}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    indicatorClassName={getProgressColor(percentage)}
                    className="h-3"
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>{spent} spent</span>
                    <span>of {limit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}