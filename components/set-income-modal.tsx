"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import axios from "axios";

interface SetIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentIncome: number;
  onIncomeUpdate: (newIncome: number) => void;
}

export function SetIncomeModal({ open, onOpenChange, currentIncome, onIncomeUpdate }: SetIncomeModalProps) {
  const [income, setIncome] = useState(currentIncome.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const incomeValue = parseFloat(income);
    if (isNaN(incomeValue) || incomeValue < 0) {
      toast.error("Please enter a valid positive number");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/profile", { income: incomeValue });
      onIncomeUpdate(response.data.data.income);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response?.data?.data?.message || "Failed to update income");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Monthly Income</DialogTitle>
          <DialogDescription>
            Set your total monthly income to track your remaining balance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income">Monthly Income (₹)</Label>
            <Input
              id="income"
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="e.g., 50000"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}