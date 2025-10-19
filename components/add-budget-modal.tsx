"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Budget } from "@/lib/types";

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
  const [error, setError] = useState<string | null>(null);

  // Fetch categories when the modal opens for the first time
  useEffect(() => {
    if (open && categories.length === 0) {
      api.get("/transactions/categories")
        .then(response => {
          const fetchedCategories = response.data.data;
          setCategories(fetchedCategories);
          if (fetchedCategories.length > 0) {
            setCategory(fetchedCategories[0]); // Set a default value
          }
        })
        .catch(err => {
          console.error("Failed to fetch categories:", err);
          setError("Could not load categories. Please try again.");
        });
    }
  }, [open, categories.length]);

  const resetForm = () => {
    setLimit("");
    setError(null);
    if (categories.length > 0) {
      setCategory(categories[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const limitValue = parseFloat(limit);
    if (!category || !limit.trim() || isNaN(limitValue) || limitValue <= 0) {
      setError("Please select a category and enter a valid positive limit.");
      setIsLoading(false);
      return;
    }

    const currentDate = new Date();
    const payload = {
      category,
      limit: limitValue,
      month: currentDate.getMonth() + 1, // JS months are 0-11
      year: currentDate.getFullYear(),
    };

    try {
      const response = await api.post("/budgets/", payload);
      onBudgetAdded(response.data.data);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.data || "Failed to create budget. It might already exist for this month.");
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
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="e.g., 5000"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
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