"use client";

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { DEPARTMENT_OPTIONS } from '@/types/staff';

interface StaffFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  departmentFilter: string;
  onDepartmentChange: (d: string) => void;
  statusFilter: string;
  onStatusChange: (s: string) => void;
}

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' },
];

export function StaffFilterToolbar({
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
}: StaffFilterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, title, or department..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Department Filter */}
      <select
        value={departmentFilter}
        onChange={(e) => onDepartmentChange(e.target.value)}
        className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
      >
        <option value="all">All Departments</option>
        {DEPARTMENT_OPTIONS.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              statusFilter === tab.value
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
