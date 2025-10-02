import { Transaction } from "@/lib/types";

export function normalizeTransaction(transaction: Transaction): Transaction {
    return {
        ...transaction,
        date: transaction.date || new Date().toISOString(),
        _id: transaction._id || '',
        amount: transaction.amount || 0,
        category: transaction.category || 'Other',
        description: transaction.description || 'No description',
        status: transaction.status || 'completed'
    };
}