"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
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
  
  // FIX #39: Focus management refs
  const categoryRef = useRef<HTMLSelectElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      // FIX #39: Store previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      if (categories.length === 0) {
        api.get("/transactions/categories")
          .then(response => {
            const fetchedCategories = response.data.data;
            setCategories(fetchedCategories);
            if (fetchedCategories.length > 0) {
              setCategory(fetchedCategories[0]);
            }
            // FIX #39: Focus first input after data loads
            setTimeout(() => categoryRef.current?.focus(), 100);
          })
          .catch(err => {
            console.error("Failed to fetch categories:", err);
            toast.error("Could not load categories");
          });
      } else {
        // FIX #39: Focus immediately if categories already loaded
        setTimeout(() => categoryRef.current?.focus(), 100);
      }
    } else {
      // FIX #39: Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
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

    // FIX #40: Consistent rounding validation
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
    // FIX #40: Round to 2 decimal places consistently
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Budget</DialogTitle>
          <DialogDescription>
            Set a spending limit for a specific category for the current month.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              ref={categoryRef}
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-input rounded-md"
              disabled={isLoading || categories.length === 0}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">Budget Limit (₹)</Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="e.g., 5000"
              disabled={isLoading}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}