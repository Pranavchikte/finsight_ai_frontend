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
import { Trash2, DollarSign, Loader2 } from "lucide-react";
import { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
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

  if (!transactions || transactions.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
      return "bg-green-500/10 text-green-500 border-green-500/20";
    if (categoryLower.includes("health"))
      return "bg-red-500/10 text-red-500 border-red-500/20";
    return "bg-gray-500/10 text-gray-500 border-gray-500/20";
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
          "mb-4 hover:shadow-md transition-all duration-200",
          isProcessing && "opacity-60",
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="font-semibold text-foreground text-base">
                {transaction.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(transaction.date)}
              </p>
            </div>
            {/* FIX #12: Mobile check already exists */}
            {!isProcessing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(transaction._id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 w-10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            {isProcessing ? (
              <>
                <AIProcessingIndicator variant="badge" />
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium",
                    getCategoryColor(transaction.category),
                  )}
                >
                  {transaction.category}
                </Badge>
                <span className="text-lg font-bold">
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
        <div className="flex items-center gap-2 mb-4 px-1">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">
            Recent Transactions
          </h3>
        </div>
        {transactions.map((transaction) => (
          <MobileTransactionCard
            key={transaction._id}
            transaction={transaction}
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl animate-fade-in-up">
        <div className="p-6 border-b border-border/50">
          <h3 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Recent Transactions
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Track and analyze your spending patterns
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-card-foreground font-semibold">
                Description
              </TableHead>
              <TableHead className="text-card-foreground font-semibold">
                Category
              </TableHead>
              <TableHead className="text-card-foreground font-semibold text-right">
                Amount
              </TableHead>
              <TableHead className="text-card-foreground font-semibold text-right">
                Date
              </TableHead>
              <TableHead className="text-right text-card-foreground font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) =>
              transaction.status === "processing" ? (
                <TableRow key={transaction._id} className="opacity-60">
                  <TableCell className="font-medium py-4">
                    {transaction.description}
                  </TableCell>
                  <TableCell className="py-4">
                    <AIProcessingIndicator variant="badge" />
                  </TableCell>
                  <TableCell className="font-bold py-4 text-right">
                    <span className="text-lg text-muted-foreground">---</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground py-4 text-right">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <Loader2 className="h-4 w-4 animate-spin inline-block" />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={transaction._id}>
                  <TableCell className="text-card-foreground font-medium py-4">
                    {transaction.description}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        getCategoryColor(transaction.category),
                      )}
                    >
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-card-foreground font-bold py-4 text-right">
                    <span className="text-lg">
                      ₹{transaction.amount.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground py-4 text-right">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    {/* FIX #12: Added disabled and styling */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(transaction._id)}
                      disabled={transaction.status === "processing"}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              transaction from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDeleteTransaction(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
