// set-income-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, DollarSign } from "lucide-react";
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

  useEffect(() => {
    if (open) {
      setIncome(currentIncome.toString());
    }
  }, [open, currentIncome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const incomeValue = parseFloat(income);
    if (isNaN(incomeValue)) {
      toast.error("Please enter a valid amount");
      setIsLoading(false);
      return;
    }
    if (incomeValue < 0) {
      toast.error("Income cannot be negative");
      setIsLoading(false);
      return;
    }
    if (incomeValue > 100000000) {
      toast.error("Income too large. Maximum is ₹10,00,00,000");
      setIsLoading(false);
      return;
    }
    
    const roundedIncome = Math.round(incomeValue * 100) / 100;

    try {
      const response = await api.post("/auth/profile", { income: roundedIncome });
      onIncomeUpdate(response.data.data.income);
      onOpenChange(false);
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
      <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Update Monthly Income</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Set your total monthly income to track your remaining balance accurately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="income" className="text-sm font-medium">
              Monthly Income (₹)
            </Label>
            <Input
              id="income"
              type="number"
              step="0.01"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="e.g., 50000"
              className="h-11 bg-muted/50 border-border/50 focus:border-primary/50 text-base"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Your current income: ₹{currentIncome.toFixed(2)}
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
              Save Income
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}