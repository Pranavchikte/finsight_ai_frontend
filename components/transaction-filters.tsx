"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Search, Filter, Calendar, DollarSign } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

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

  const activeFilterCount = [
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-muted/50 border-border/50 focus:border-primary/50"
          />
        </div>

        {/* Category Filter */}
        <Select value={category} onValueChange={(value) => setCategory(value === "all" ? "" : value)}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 bg-muted/50 border-border/50">
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

        {/* Advanced Filters Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "gap-2 h-10 relative",
                activeFilterCount > 0 && "border-primary/50"
              )}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[320px] sm:w-[400px]">
            <SheetHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle>Advanced Filters</SheetTitle>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Date Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  Date Range
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                {dateError && (
                  <p className="text-xs text-destructive">{dateError}</p>
                )}
              </div>

              {/* Amount Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Amount Range
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Min (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Max (₹)</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Order</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest</SelectItem>
                        <SelectItem value="asc">Oldest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
          
          {category && (
            <Badge variant="secondary" className="gap-1 pl-2 pr-1">
              {category}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCategory("")}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {startDate && (
            <Badge variant="secondary" className="gap-1 pl-2 pr-1">
              From: {new Date(startDate).toLocaleDateString()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStartDate("")}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {endDate && (
            <Badge variant="secondary" className="gap-1 pl-2 pr-1">
              To: {new Date(endDate).toLocaleDateString()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEndDate("")}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {minAmount && (
            <Badge variant="secondary" className="gap-1 pl-2 pr-1">
              Min: ₹{minAmount}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMinAmount("")}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {maxAmount && (
            <Badge variant="secondary" className="gap-1 pl-2 pr-1">
              Max: ₹{maxAmount}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMaxAmount("")}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}