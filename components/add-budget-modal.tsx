// add-budget-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Target } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Budget } from "@/lib/types";
import axios from "axios";

interface AddBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBudgetAdded: (newBudget: Budget) => void;
}

export function AddBudgetModal({ open, onOpenChange, onBudgetAdded }: AddBudgetModalProps) {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (categories.length === 0) {
        api.get("/transactions/categories")
          .then(response => {
            const fetchedCategories = response.data.data;
            setCategories(fetchedCategories);
            if (fetchedCategories.length > 0) {
              setCategory(fetchedCategories[0]);
            }
          })
          .catch(err => {
            console.error("Failed to fetch categories:", err);
            toast.error("Could not load categories");
          });
      }
    }
  }, [open, categories.length]);

  const resetForm = () => {
    setLimit("");
    if (categories.length > 0) {
      setCategory(categories[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const limitValue = parseFloat(limit);
    if (isNaN(limitValue)) {
      toast.error("Please enter a valid amount");
      setIsLoading(false);
      return;
    }
    if (limitValue <= 0) {
      toast.error("Budget limit must be greater than zero");
      setIsLoading(false);
      return;
    }
    if (limitValue > 10000000) {
      toast.error("Budget limit too large. Maximum is ₹1,00,00,000");
      setIsLoading(false);
      return;
    }
    const roundedLimit = Math.round(limitValue * 100) / 100;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const payload = {
      category,
      limit: roundedLimit,
      month: currentMonth,
      year: currentYear,
    };

    try {
      const response = await api.post("/budgets/", payload);
      onBudgetAdded(response.data.data);
      onOpenChange(false);
      resetForm();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response?.data?.data?.message || "Failed to create budget";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Create Budget</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Set a spending limit for a specific category for the current month.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory} disabled={isLoading || categories.length === 0}>
              <SelectTrigger className="h-11 bg-muted/50 border-border/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit" className="text-sm font-medium">
              Budget Limit (₹)
            </Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="e.g., 5000"
              disabled={isLoading}
              className="h-11 bg-muted/50 border-border/50 focus:border-primary/50 text-base"
            />
            <p className="text-xs text-muted-foreground">
              Set a realistic monthly spending limit for this category
            </p>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-border/50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
              className="transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="gap-2 bg-primary hover:bg-primary/90 transition-all"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}