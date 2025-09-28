// lib/types.ts
export interface Transaction {
    _id: string;
    user_id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
}

export interface User {
    _id: string;
    email: string;
}