"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Budget } from "@/lib/types";
import { PlusCircle, Target, TrendingUp, AlertCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface BudgetListProps {
  budgets: Budget[];
  onAddBudget: () => void;
}

export const BudgetList = memo(function BudgetList({ budgets, onAddBudget }: BudgetListProps) {
  const getProgressColor = (value: number) => {
    if (value > 90) return "bg-destructive";
    if (value > 70) return "bg-warning";
    return "bg-success";
  };

  const getProgressGlow = (value: number) => {
    if (value > 90) return "shadow-[0_0_8px_var(--destructive-glow)]";
    if (value > 70) return "shadow-[0_0_8px_var(--warning-glow)]";
    return "";
  };

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
        <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Monthly Budgets
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddBudget}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 gap-1.5"
        >
          <PlusCircle className="h-4 w-4" />
          Add Budget
        </Button>
      </CardHeader>
      
      <CardContent className="pt-6">
        {budgets.length === 0 ? (
          /* Enhanced Empty State */
          <div className="text-center py-12 space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-foreground text-xl">
                No budgets set yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Set spending limits to track your expenses better and stay on top of your finances
              </p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 text-left space-y-2 max-w-md mx-auto border border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm font-semibold text-foreground">
                  Quick Tip
                </p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Start with essential categories like "Food & Dining" or "Transportation" to control your biggest expenses
              </p>
            </div>
            
            <Button 
              onClick={onAddBudget} 
              size="lg" 
              className="mt-4 btn-transition gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              Create Your First Budget
            </Button>
          </div>
        ) : (
          /* Budget List */
          <div className="space-y-5">
            {budgets.map((budget, index) => {
              const percentage = budget.limit > 0 
                ? Math.round((budget.current_spend / budget.limit) * 100 * 100) / 100
                : 0;
              
              const spent = formatCurrency(budget.current_spend);
              const limit = formatCurrency(budget.limit);
              const remainingValue = Math.abs(budget.limit - budget.current_spend);
              const remaining = formatCurrency(remainingValue);
              
              const isOverBudget = budget.current_spend > budget.limit;
              const isWarning = percentage > 70 && percentage <= 90;
              const isDanger = percentage > 90;

              return (
                <div 
                  key={budget._id} 
                  className={cn(
                    "space-y-3 p-4 rounded-lg transition-all duration-300 animate-fade-in-up",
                    "bg-muted/20 border border-border/30 hover:border-border/60 hover:bg-muted/30",
                    isOverBudget && "border-destructive/30 bg-destructive/5",
                    `animate-stagger-${Math.min(index + 1, 5)}`
                  )}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground text-base">
                        {budget.category}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{spent} spent</span>
                        <span>•</span>
                        <span>{limit} limit</span>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-0.5">
                      <div className={cn(
                        "text-lg font-bold tabular-nums",
                        isOverBudget && "text-destructive",
                        isDanger && !isOverBudget && "text-destructive",
                        isWarning && "text-warning",
                        !isDanger && !isWarning && !isOverBudget && "text-foreground"
                      )}>
                        {Math.min(Math.round(percentage), 999)}%
                      </div>
                      
                      {isOverBudget ? (
                        <div className="flex items-center gap-1 text-xs text-destructive font-medium">
                          <AlertCircle className="h-3 w-3" />
                          <span>{remaining} over</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span>{remaining} left</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <Progress
                      value={Math.min(percentage, 100)}
                      indicatorClassName={cn(
                        getProgressColor(percentage),
                        "transition-all duration-500 animate-progress-fill",
                        getProgressGlow(percentage)
                      )}
                      className="h-2.5"
                    />
                    
                    {/* Over Budget Indicator */}
                    {percentage > 100 && (
                      <div className="flex items-center gap-1.5 text-xs text-destructive font-medium animate-fade-in">
                        <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                        <span>{Math.round(percentage - 100)}% over budget</span>
                      </div>
                    )}
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
  return JSON.stringify(prevProps.budgets) === JSON.stringify(nextProps.budgets);
});