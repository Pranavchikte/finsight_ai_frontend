"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Loader2, Calendar, Tag } from "lucide-react";
import { Transaction } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AIProcessingIndicator } from "@/components/ai-processing-indicator";

interface TransactionTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (transactionId: string) => void;
}

export function TransactionTable({
  transactions,
  onDeleteTransaction,
}: TransactionTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!transactions || transactions.length === 0) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("food"))
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (categoryLower.includes("transport"))
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (categoryLower.includes("shop"))
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (categoryLower.includes("entertainment"))
      return "bg-pink-500/10 text-pink-500 border-pink-500/20";
    if (categoryLower.includes("utilities"))
      return "bg-success/10 text-success border-success/20";
    if (categoryLower.includes("health"))
      return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20";
  };

  const handleDelete = async () => {
    if (!deleteId || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDeleteTransaction(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Mobile Card View
  const MobileTransactionCard = ({
    transaction,
  }: {
    transaction: Transaction;
  }) => {
    const isProcessing = transaction.status === "processing";

    return (
      <Card
        className={cn(
          "transition-all duration-300 hover:shadow-md border-border/50 bg-card/80 backdrop-blur-sm",
          isProcessing && "opacity-60"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {transaction.description || <span className="text-muted-foreground italic">No description</span>}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(transaction.date, 'short')}
              </div>
            </div>
            {!isProcessing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(transaction._id)}
                disabled={isDeleting}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
            {isProcessing ? (
              <>
                <AIProcessingIndicator variant="badge" />
                <Loader2 className="h-4 w-4 animate-spin text-ai-accent" />
              </>
            ) : (
              <>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium text-xs truncate max-w-[140px] gap-1",
                    getCategoryColor(transaction.category)
                  )}
                >
                  <Tag className="h-3 w-3" />
                  {transaction.category}
                </Badge>
                <span className="text-lg font-bold text-foreground tabular-nums">
                  ₹{transaction.amount.toFixed(2)}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {/* Mobile View - Card List */}
      <div className="md:hidden space-y-3">
        {transactions.map((transaction, index) => (
          <div
            key={transaction._id}
            className={cn(
              "animate-fade-in-up",
              `animate-stagger-${Math.min(index + 1, 5)}`
            )}
          >
            <MobileTransactionCard transaction={transaction} />
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block border border-border/50 bg-card/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="text-foreground font-semibold">Description</TableHead>
              <TableHead className="text-foreground font-semibold">Category</TableHead>
              <TableHead className="text-foreground font-semibold text-right">Amount</TableHead>
              <TableHead className="text-foreground font-semibold">Date</TableHead>
              <TableHead className="text-right text-foreground font-semibold w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) =>
              transaction.status === "processing" ? (
                <TableRow 
                  key={transaction._id} 
                  className={cn(
                    "opacity-60 hover:bg-muted/30 border-b border-border/30 animate-fade-in-up",
                    `animate-stagger-${Math.min(index + 1, 5)}`
                  )}
                >
                  <TableCell className="font-medium py-4">
                    {transaction.description}
                  </TableCell>
                  <TableCell className="py-4">
                    <AIProcessingIndicator variant="badge" />
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <span className="text-muted-foreground">---</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground py-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(transaction.date, 'long')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <Loader2 className="h-4 w-4 animate-spin inline-block text-ai-accent" />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow 
                  key={transaction._id}
                  className={cn(
                    "hover:bg-muted/30 border-b border-border/30 transition-colors animate-fade-in-up",
                    `animate-stagger-${Math.min(index + 1, 5)}`
                  )}
                >
                  <TableCell className="text-foreground font-medium py-4">
                    {transaction.description || <span className="text-muted-foreground italic">No description</span>}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium truncate max-w-[160px] gap-1.5",
                        getCategoryColor(transaction.category)
                      )}
                    >
                      <Tag className="h-3 w-3" />
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground font-bold py-4 text-right">
                    <span className="text-base tabular-nums">
                      ₹{transaction.amount.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground py-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(transaction.date, 'long')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(transaction._id)}
                      disabled={transaction.status === "processing" || isDeleting}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground leading-relaxed">
              This action cannot be undone. This will permanently delete this transaction from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50 transition-all gap-2"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}