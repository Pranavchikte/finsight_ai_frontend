"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Transaction } from "@/lib/types";
import axios from "axios";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionAdded: (newTransaction: Transaction) => void;
}

export function AddExpenseModal({ open, onOpenChange, onTransactionAdded }: AddExpenseModalProps) {
  const [mode, setMode] = useState("ai");
  const [aiText, setAiText] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualCategory, setManualCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && categories.length === 0) {
      api.get("/transactions/categories")
        .then(response => {
          const fetchedCategories = response.data.data;
          setCategories(fetchedCategories);
          if (fetchedCategories.length > 0) {
            setManualCategory(fetchedCategories[0]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch categories:", err);
          toast.error("Failed to load categories");
        });
    }
  }, [open, categories.length]);

  const resetForm = () => {
    setAiText("");
    setManualDescription("");
    setManualAmount("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let payload;
    if (mode === "ai") {
      // FIX #9: AI Text Validation
      const trimmedText = aiText.trim();
      if (!trimmedText) {
        toast.error("AI description cannot be empty");
        setIsLoading(false);
        return;
      }
      if (trimmedText.length > 200) {
        toast.error("Description too long. Maximum 200 characters");
        setIsLoading(false);
        return;
      }
      payload = { mode: "ai", text: trimmedText };
    } else {
      if (!manualDescription.trim() || !manualAmount.trim() || !manualCategory.trim()) {
        toast.error("All manual fields are required");
        setIsLoading(false);
        return;
      }

      // FIX #8: Description Length Validation
      if (manualDescription.length > 200) {
        toast.error("Description too long. Maximum 200 characters");
        setIsLoading(false);
        return;
      }

      // FIX #7: Manual Expense Validation
      const amountValue = parseFloat(manualAmount);
      if (isNaN(amountValue)) {
        toast.error("Please enter a valid amount");
        setIsLoading(false);
        return;
      }
      if (amountValue <= 0) {
        toast.error("Amount must be greater than zero");
        setIsLoading(false);
        return;
      }
      if (amountValue > 10000000) {
        toast.error("Amount too large. Maximum is ₹1,00,00,000");
        setIsLoading(false);
        return;
      }
      // Round to 2 decimals
      const roundedAmount = Math.round(amountValue * 100) / 100;

      payload = {
        mode: "manual",
        description: manualDescription,
        amount: roundedAmount,
        category: manualCategory,
      };
    }

    try {
      const response = await api.post("/transactions/", payload);
      onTransactionAdded(response.data.data);
      onOpenChange(false);
      resetForm();
      
      if (mode === "ai") {
        toast.success("Expense submitted! AI is processing...");
      } else {
        toast.success("Expense added successfully!");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response?.data?.data?.message || "Failed to add expense");
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">AI Powered</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="ai" className="space-y-4 py-4">
              <Label htmlFor="ai-text">Expense Description</Label>
              <Input
                id="ai-text"
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="e.g., Coffee with friends for 250rs..."
              />
            </TabsContent>
            <TabsContent value="manual" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="manual-desc">Description</Label>
                <Input id="manual-desc" value={manualDescription} onChange={(e) => setManualDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-amount">Amount (₹)</Label>
                <Input id="manual-amount" type="number" step="0.01" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-category">Category</Label>
                <select
                  id="manual-category"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-md"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </TabsContent>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Expense
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}