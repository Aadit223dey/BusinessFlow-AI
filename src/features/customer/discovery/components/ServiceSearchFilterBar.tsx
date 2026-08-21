"use client";

import { ServiceCategory, ServiceFilterState } from "@/types/discovery";
import { Search, X, ArrowUpDown } from "lucide-react";

interface ServiceSearchFilterBarProps {
  filters: ServiceFilterState;
  onFilterChange: (newFilters: ServiceFilterState) => void;
  categories: ServiceCategory[];
  totalResults: number;
}

export function ServiceSearchFilterBar({
  filters,
  onFilterChange,
  categories,
  totalResults,
}: ServiceSearchFilterBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  const handleCategorySelect = (categoryId: string | null) => {
    onFilterChange({
      ...filters,
      categoryId,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value as ServiceFilterState["sortBy"],
    });
  };

  const clearFilters = () => {
    onFilterChange({
      searchQuery: "",
      categoryId: null,
      tenantId: null,
      maxPrice: null,
      maxDuration: null,
      sortBy: "popular",
    });
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery.trim()) ||
    filters.categoryId !== null ||
    filters.sortBy !== "popular";

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-4 sm:p-6 backdrop-blur-md shadow-sm">
      {/* Top row: Search input & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search services, descriptions, or providers..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 pl-10 pr-10 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground"
              aria-label="Clear search text"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-3 py-2 text-xs font-semibold text-foreground">
              <ArrowUpDown className="h-3.5 w-3.5 text-emerald-500" />
              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer pr-1"
                aria-label="Sort services"
              >
                <option value="popular">Featured & Recommended</option>
                <option value="newest">Newest Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="duration_asc">Duration: Shortest</option>
              </select>
            </div>
          </div>

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

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <button
          onClick={() => handleCategorySelect(null)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
            filters.categoryId === null
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
              : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          All Services ({totalResults})
        </button>

        {categories.map((cat) => {
          const isSelected = filters.categoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
