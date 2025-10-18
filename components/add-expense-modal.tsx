"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Transaction } from "@/lib/types";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && categories.length === 0) {
      api.get("/transactions/categories")
        .then(response => {
          // --- FIX: Extract data from the standardized response ---
          const fetchedCategories = response.data.data;
          setCategories(fetchedCategories);
          if (fetchedCategories.length > 0) {
            setManualCategory(fetchedCategories[0]);
          }
          // --------------------------------------------------------
        })
        .catch(err => console.error("Failed to fetch categories:", err));
    }
  }, [open, categories.length]);

  const resetForm = () => {
    setAiText("");
    setManualDescription("");
    setManualAmount("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let payload;
    if (mode === "ai") {
      if (!aiText.trim()) {
        setError("AI description cannot be empty.");
        setIsLoading(false);
        return;
      }
      payload = { mode: "ai", text: aiText };
    } else {
      if (!manualDescription.trim() || !manualAmount.trim() || !manualCategory.trim()) {
        setError("All manual fields are required.");
        setIsLoading(false);
        return;
      }

      const amountValue = parseFloat(manualAmount);
      if (isNaN(amountValue) || amountValue <= 0){
        setError("Amount must be a positive number.");
        setIsLoading(false);
        return;
      }

      payload = {
        mode: "manual",
        description: manualDescription,
        amount: parseFloat(manualAmount),
        category: manualCategory,
      };
    }

    try {
      const response = await api.post("/transactions/", payload);
      // Pass the nested data object to the parent
      onTransactionAdded(response.data.data);
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.data?.message || "Failed to add expense.");
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
                <Input id="manual-amount" type="number" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} />
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
            {error && <p className="text-sm text-destructive">{error}</p>}
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