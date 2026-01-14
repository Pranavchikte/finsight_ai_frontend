"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import api from "@/lib/api";

interface TransactionFiltersProps {
  onFilterChange: (filters: {
    search: string;
    category: string;
    start_date?: string;
    end_date?: string;
    min_amount?: string;
    max_amount?: string;
    sort_by?: string;
    sort_order?: string;
  }) => void;
}

export function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch available categories once on component mount
  useEffect(() => {
    api.get("/transactions/categories")
      .then(res => setCategories(res.data.data))
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  // Effect to call the parent's onFilterChange function whenever a filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      const filters: any = { search, category, sort_by: sortBy, sort_order: sortOrder };
      
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (minAmount) filters.min_amount = minAmount;
      if (maxAmount) filters.max_amount = maxAmount;
      
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(handler);
  }, [search, category, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder, onFilterChange]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setSortBy("date");
    setSortOrder("desc");
  };

  return (
    <div className="space-y-4 mb-6 bg-card/50 p-6 rounded-lg border">
      {/* Row 1: Search and Category */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow"
        />
        <Select value={category} onValueChange={(value) => setCategory(value === "all" ? "" : value)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: Date Range */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-1 block">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-1 block">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Row 3: Amount Range */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-1 block">Min Amount (₹)</label>
          <Input
            type="number"
            placeholder="0"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-1 block">Max Amount (₹)</label>
          <Input
            type="number"
            placeholder="10000"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>
      </div>

      {/* Row 4: Sort Options */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-1 block">Sort By</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-1 block">Order</label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2">
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
}