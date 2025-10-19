"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";

interface TransactionFiltersProps {
  onFilterChange: (filters: { search: string; category: string }) => void;
}

export function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch available categories once on component mount
  useEffect(() => {
    api.get("/transactions/categories")
      .then(res => setCategories(res.data.data))
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  // Effect to call the parent's onFilterChange function whenever a filter changes
  useEffect(() => {
    // This is a simple debounce to avoid firing API calls on every keystroke
    const handler = setTimeout(() => {
      onFilterChange({ search, category });
    }, 300); // Wait 300ms after user stops typing

    return () => {
      clearTimeout(handler);
    };
  }, [search, category, onFilterChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
  );
}