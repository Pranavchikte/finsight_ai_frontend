"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Budget } from "@/lib/types";
import { PlusCircle } from "lucide-react";
// The unused 'cn' import has been removed.

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
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-xl animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
        <CardTitle className="text-xl font-bold text-card-foreground">
          Monthly Budgets
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onAddBudget} className="text-primary hover:text-primary/80">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {budgets.length === 0 ? (
          // FIX: Replaced ' with &apos; to fix unescaped entity error
          <p className="text-center text-muted-foreground">
            You haven&apos;t set any budgets for this month yet.
          </p>
        ) : (
          <div className="space-y-6">
            {budgets.map((budget) => {
              const percentage = budget.limit > 0 ? (budget.current_spend / budget.limit) * 100 : 0;
              const spent = budget.current_spend.toFixed(2);
              const limit = budget.limit.toFixed(2);
              const remaining = (budget.limit - budget.current_spend).toFixed(2);
              const isOverBudget = budget.current_spend > budget.limit;

              return (
                <div key={budget._id}>
                  <div className="mb-2 flex justify-between items-baseline">
                    <span className="font-semibold text-card-foreground">{budget.category}</span>
                    <span className={`text-sm font-medium ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {isOverBudget ? `₹${Math.abs(parseFloat(remaining)).toFixed(2)} over` : `₹${remaining} left`}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)}
                    indicatorClassName={getProgressColor(percentage)}
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>₹{spent} spent</span>
                    <span>of ₹{limit}</span>
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