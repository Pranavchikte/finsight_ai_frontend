"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, SlidersHorizontal, Loader2 } from "lucide-react"; // Added Loader2
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/transactions/categories")
      .then(res => setCategories(res.data.data))
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
          setDateError("End date must be after start date");
          return;
        }
      }
      setDateError(null);

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
    setDateError(null);
  };

  const hasActiveFilters = search || category || startDate || endDate || minAmount || maxAmount;

  return (
    <>
      <div className="md:hidden mb-4 space-y-3">
        <div className="flex gap-2">
          {/* FIX #17: Mobile Search with Loader */}
          <div className="relative flex-1">
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            {search && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={category} onValueChange={(value) => setCategory(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  {dateError && (
                    <p className="text-xs text-destructive mt-1">{dateError}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Min Amount (₹)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Max Amount (₹)</label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Order</label>
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

                <Button onClick={clearFilters} variant="outline" className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {category && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtering by:</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCategory("")}
              className="h-7 text-xs"
            >
              {category}
              <X className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <div className="hidden md:block space-y-4 mb-6 bg-card/50 p-6 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* FIX #17: Desktop Search with Loader */}
          <div className="relative flex-grow">
            <Input
              placeholder="Search by description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            {search && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          
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
            {dateError && (
              <p className="text-xs text-destructive mt-1">{dateError}</p>
            )}
          </div>
        </div>

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
    </>
  );
}