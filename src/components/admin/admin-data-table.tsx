"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, ReactNode } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export type ColumnDef<T> = {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
};

type AdminDataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  totalCount: number;
  pageSize?: number;
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    options: { label: string; value: string }[];
  }[];
  actions?: ReactNode;
  emptyState?: ReactNode;
  selectable?: boolean;
  bulkActions?: (selectedIds: string[]) => ReactNode;
  rowIdAccessor?: (item: T) => string; // Function to get unique ID from row, defaults to (row as any)._id
};

export function AdminDataTable<T>({
  data,
  columns,
  totalCount,
  pageSize = 10,
  searchPlaceholder = "Search...",
  filters = [],
  actions,
  emptyState,
  selectable = false,
  bulkActions,
  rowIdAccessor = (item: any) => item._id,
}: AdminDataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  
  const [searchValue, setSearchValue] = useState(currentSearch);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset selection when data changes (e.g. pagination or search)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [data]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateQueryParams({ search: searchValue, page: "1" });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchValue, currentSearch]);

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(updates).forEach((key) => {
      if (updates[key] === null || updates[key] === "") {
        params.delete(key);
      } else {
        params.set(key, updates[key] as string);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = data.map(rowIdAccessor);
      setSelectedIds(new Set(allIds));
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[var(--color-outline-variant)]/30 card-shadow overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-[var(--color-outline-variant)]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-container-lowest)]">
        <div className="flex flex-1 flex-col sm:flex-row gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-on-surface-variant)]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>
          
          {filters.map((filter) => {
            const currentValue = searchParams.get(filter.key) || "";
            return (
              <select
                key={filter.key}
                value={currentValue}
                onChange={(e) => updateQueryParams({ [filter.key]: e.target.value, page: "1" })}
                className="px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer max-w-[200px] truncate"
              >
                <option value="">{filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          })}
        </div>
        
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {/* Bulk Actions Banner */}
      {selectable && selectedIds.size > 0 && bulkActions && (
        <div className="px-6 py-3 bg-[var(--color-primary)]/10 border-b border-[var(--color-primary)]/20 flex items-center justify-between animate-in fade-in duration-300 slide-in-from-top-2">
          <span className="text-sm font-bold text-[var(--color-primary)]">
            {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions(Array.from(selectedIds))}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[400px]">
        {data.length === 0 ? (
          emptyState || (
            <div className="flex flex-col items-center justify-center h-[400px] text-[var(--color-on-surface-variant)]">
              <p>No records found.</p>
            </div>
          )
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-container-low)]">
                {selectable && (
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === data.length && data.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((col, i) => (
                  <th key={i} className={`p-4 text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-outline-variant)]/20">
              {data.map((row, i) => {
                const rowId = rowIdAccessor(row);
                const isSelected = selectedIds.has(rowId);
                return (
                  <tr key={i} className={`hover:bg-[var(--color-surface-container-lowest)] transition-colors ${isSelected ? "bg-[var(--color-primary)]/5" : ""}`}>
                    {selectable && (
                      <td className="p-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(rowId)}
                          className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col, j) => (
                      <td key={j} className={`p-4 text-sm text-[var(--color-on-surface)] ${col.className || ""}`}>
                        {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? "") : ""}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-[var(--color-outline-variant)]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface-container-lowest)]">
          <p className="text-sm text-[var(--color-on-surface-variant)] font-medium text-center sm:text-left">
            Showing <span className="font-bold text-[var(--color-on-surface)]">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> to <span className="font-bold text-[var(--color-on-surface)]">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold text-[var(--color-on-surface)]">{totalCount}</span> entries
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => updateQueryParams({ page: String(currentPage - 1) })}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-container-high)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateQueryParams({ page: String(pageNum) })}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === pageNum ? "bg-[var(--color-primary)] text-white" : "hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => updateQueryParams({ page: String(currentPage + 1) })}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg hover:bg-[var(--color-surface-container-high)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
