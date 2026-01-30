// add-expense-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, Sparkles, Receipt } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Transaction } from "@/lib/types";
import axios from "axios";
import { cn } from "@/lib/utils";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (isSubmitting) return;
    
    setIsLoading(true);
    setIsSubmitting(true);

    let payload;
    if (mode === "ai") {
      const trimmedText = aiText.trim();
      if (!trimmedText) {
        toast.error("AI description cannot be empty");
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }
      if (trimmedText.length > 200) {
        toast.error("Description too long. Maximum 200 characters");
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }
      payload = { mode: "ai", text: trimmedText };
    } else {
      if (!manualDescription.trim() || !manualAmount.trim() || !manualCategory.trim()) {
        toast.error("All fields are required");
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      if (manualDescription.length > 200) {
        toast.error("Description too long. Maximum 200 characters");
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      const amountValue = parseFloat(manualAmount);
      if (isNaN(amountValue)) {
        toast.error("Please enter a valid amount");
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }
      if (amountValue <= 0) {
        toast.error("Amount must be greater than zero");
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }
      if (amountValue > 10000000) {
        toast.error("Amount too large. Maximum is ₹1,00,00,000");
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }
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
        const errorData = err.response.data?.data;
        
        if (errorData?.error_details) {
          toast.error(
            <div className="flex flex-col gap-1">
              <div className="font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                AI Parsing Failed
              </div>
              <div className="text-sm">{errorData.error_details}</div>
            </div>,
            { duration: 5000 }
          );
        } else {
          toast.error(errorData?.message || "Failed to add expense");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="border-b border-border/50 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Add New Expense
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="ai" className="gap-2 data-[state=active]:bg-card">
              <Sparkles className="h-4 w-4" />
              AI Powered
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2 data-[state=active]:bg-card">
              <Receipt className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="ai" className="space-y-4 py-6">
              <div className="space-y-2">
                <Label htmlFor="ai-text" className="text-sm font-medium">
                  Describe your expense
                </Label>
                <Input
                  id="ai-text"
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="e.g., Coffee with friends for 250rs..."
                  disabled={isSubmitting}
                  className="h-11 bg-muted/50 border-border/50 focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  AI will automatically extract amount and category
                </p>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 py-6">
              <div className="space-y-2">
                <Label htmlFor="manual-desc" className="text-sm font-medium">
                  Description
                </Label>
                <Input 
                  id="manual-desc" 
                  value={manualDescription} 
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Enter description"
                  disabled={isSubmitting}
                  className="h-11 bg-muted/50 border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-amount" className="text-sm font-medium">
                  Amount (₹)
                </Label>
                <Input 
                  id="manual-amount" 
                  type="number" 
                  step="0.01" 
                  value={manualAmount} 
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  className="h-11 bg-muted/50 border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-category" className="text-sm font-medium">
                  Category
                </Label>
                <Select value={manualCategory} onValueChange={setManualCategory} disabled={isSubmitting}>
                  <SelectTrigger className="h-11 bg-muted/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <DialogFooter className="gap-2 pt-4 border-t border-border/50">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isSubmitting}
                className="transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isSubmitting}
                className="gap-2 bg-primary hover:bg-primary/90 transition-all"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Expense
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}