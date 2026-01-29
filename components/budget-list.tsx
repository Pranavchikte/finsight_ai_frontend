"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Budget } from "@/lib/types";
import { PlusCircle, Target } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface BudgetListProps {
  budgets: Budget[];
  onAddBudget: () => void;
}

// FIX #37: React.memo optimization - only re-render if budgets array changes
export const BudgetList = memo(function BudgetList({ budgets, onAddBudget }: BudgetListProps) {
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
        {/* FIX #41: Enhanced empty state */}
        {budgets.length === 0 ? (
          <div className="text-center py-12 space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Target className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-foreground text-xl">
                No budgets set yet
              </p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Set spending limits to track your expenses better and stay on top of your finances
              </p>
            </div>
            <div className="bg-accent/30 rounded-lg p-4 text-left space-y-2 max-w-md mx-auto border border-border/50">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                💡 Quick Tip
              </p>
              <p className="text-sm text-muted-foreground">
                Start with essential categories like "Food & Dining" or "Transportation" to control your biggest expenses
              </p>
            </div>
            <Button onClick={onAddBudget} size="lg" className="mt-4">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Your First Budget
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {budgets.map((budget) => {
              // FIX #40: Consistent currency rounding
              const percentage = budget.limit > 0 
                ? Math.round((budget.current_spend / budget.limit) * 100 * 100) / 100
                : 0;
              
              const spent = formatCurrency(budget.current_spend);
              const limit = formatCurrency(budget.limit);
              const remainingValue = Math.abs(budget.limit - budget.current_spend);
              const remaining = formatCurrency(remainingValue);
              
              const isOverBudget = budget.current_spend > budget.limit;

              return (
                <div key={budget._id} className="space-y-2">
                  <div className="flex justify-between items-baseline">
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
                        {/* FIX #40: Round percentage display */}
                        {Math.min(Math.round(percentage), 999)}%
                        {percentage > 100 && (
                          <span className="text-xs ml-1">
                            ({Math.round(percentage - 100)}% over)
                          </span>
                        )}
                      </span>
                      <span className={cn(
                        "text-xs ml-2",
                        isOverBudget ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {isOverBudget ? `${remaining} over` : `${remaining} left`}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    indicatorClassName={getProgressColor(percentage)}
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
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
}, (prevProps, nextProps) => {
  // FIX #37: Custom comparison - only re-render if budgets actually changed
  return JSON.stringify(prevProps.budgets) === JSON.stringify(nextProps.budgets);
});