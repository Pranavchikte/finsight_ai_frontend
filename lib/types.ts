// lib/types.ts
export interface Transaction {
    _id: string;
    user_id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    status?: 'processing' | 'completed' | 'failed';
}

export interface User {
    _id: string;
    email: string;
}

export interface Budget {
    _id: string;
    user_id: string;
    category: string;
    limit: number;
    month: number;
    year: number;
    current_spend: number; 
    created_at: string;
}