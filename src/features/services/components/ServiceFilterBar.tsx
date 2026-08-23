"use client";

import { ServiceCategory, ServiceFilterParams } from "@/types/service";
import { Search, X, Filter } from "lucide-react";

interface ServiceFilterBarProps {
  filters: ServiceFilterParams;
  onFilterChange: (filters: ServiceFilterParams) => void;
  categories: ServiceCategory[];
  totalResults: number;
}

export function ServiceFilterBar({
  filters,
  onFilterChange,
  categories,
  totalResults,
}: ServiceFilterBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleStatusChange = (status: "all" | "active" | "inactive") => {
    onFilterChange({
      ...filters,
      status,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      categoryId: e.target.value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      categoryId: "all",
      status: "all",
    });
  };

  const hasActiveFilters =
    Boolean(filters.search?.trim()) ||
    (filters.categoryId && filters.categoryId !== "all") ||
    (filters.status && filters.status !== "all");

  const currentStatus = filters.status || "all";

  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-2xl border border-border/60 bg-card/80 p-3 sm:p-4 backdrop-blur-md shadow-sm">
      {/* Left: Search input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={filters.search || ""}
          onChange={handleSearchChange}
          placeholder={`Search ${totalResults} services...`}
          className="w-full rounded-xl border border-border bg-background/80 pl-10 pr-9 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ ...filters, search: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Right: Status Tabs & Category Selector */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Tabs */}
        <div className="inline-flex rounded-xl border border-border/80 bg-muted/50 p-1 text-xs font-semibold">
          <button
            onClick={() => handleStatusChange("all")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              currentStatus === "all"
                ? "bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleStatusChange("active")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              currentStatus === "active"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleStatusChange("inactive")}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              currentStatus === "inactive"
                ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <select
            value={filters.categoryId || "all"}
            onChange={handleCategoryChange}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer pr-1"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
