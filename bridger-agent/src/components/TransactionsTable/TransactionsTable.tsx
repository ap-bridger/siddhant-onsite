"use client";

import { useState, useMemo } from "react";
import { Transaction } from "@/lib/types";
import { formatCents, formatDate } from "@/lib/format";
import { CategoriesList } from "@/components/CategoriesList/CategoriesList";

/** Every possible column key */
type ColumnKey =
  | "id"
  | "bank_account_id"
  | "date"
  | "description"
  | "amount_cents"
  | "pair_id"
  | "vendor"
  | "qbo_id"
  | "match_id"
  | "categories";

interface ColumnDef {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
  sortable?: boolean;
}

type SortDirection = "asc" | "desc";

interface SortState {
  key: ColumnKey;
  direction: SortDirection;
}

/** Columns that support sorting */
const SORTABLE_KEYS: Set<ColumnKey> = new Set([
  "date",
  "description",
  "amount_cents",
  "vendor",
]);

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", defaultVisible: false },
  { key: "bank_account_id", label: "Bank Account", defaultVisible: false },
  { key: "date", label: "Date", defaultVisible: true, sortable: true },
  { key: "description", label: "Description", defaultVisible: true, sortable: true },
  { key: "amount_cents", label: "Amount", defaultVisible: true, sortable: true },
  { key: "pair_id", label: "Pair", defaultVisible: true },
  { key: "vendor", label: "Vendor", defaultVisible: true, sortable: true },
  { key: "qbo_id", label: "QBO ID", defaultVisible: false },
  { key: "match_id", label: "Match", defaultVisible: false },
  { key: "categories", label: "Categories", defaultVisible: true },
];

function isMissing(txn: Transaction): boolean {
  return !txn.vendor || !txn.categories || txn.categories.length === 0;
}

/** Compare two transactions by a sortable column */
function compareByColumn(
  a: Transaction,
  b: Transaction,
  key: ColumnKey,
  direction: SortDirection
): number {
  const dir = direction === "asc" ? 1 : -1;

  switch (key) {
    case "date":
      return dir * a.date.localeCompare(b.date);
    case "description":
      return dir * a.description.localeCompare(b.description);
    case "amount_cents":
      return dir * (a.amount_cents - b.amount_cents);
    case "vendor": {
      const av = a.vendor ?? "";
      const bv = b.vendor ?? "";
      return dir * av.localeCompare(bv);
    }
    default:
      return 0;
  }
}

function renderCell(txn: Transaction, key: ColumnKey): React.ReactNode {
  switch (key) {
    case "id":
      return <span className="font-mono text-xs">{txn.id}</span>;
    case "bank_account_id":
      return <span className="font-mono text-xs">{txn.bank_account_id}</span>;
        case "date":
      return formatDate(txn.date);
    case "description":
      return txn.description;
    case "amount_cents":
      return (
        <span className={txn.amount_cents < 0 ? "text-red-500" : "text-green-600"}>
          {formatCents(txn.amount_cents)}
        </span>
      );
    case "pair_id":
      return txn.pair_id ?? <span className="text-gray-400">&mdash;</span>;
    case "vendor":
      return txn.vendor ?? <span className="text-gray-400">&mdash;</span>;
    case "qbo_id":
      return txn.qbo_id ? (
        <span className="font-mono text-xs">{txn.qbo_id}</span>
      ) : (
        <span className="text-gray-400">&mdash;</span>
      );
    case "match_id":
      return txn.match_id ?? <span className="text-gray-400">&mdash;</span>;
        case "categories":
      return <CategoriesList categories={txn.categories} />;
    default:
      return null;
  }
}

/** Optional per-column custom renderers — keyed by ColumnKey */
export type CellRenderers = Partial<
  Record<ColumnKey, (txn: Transaction) => React.ReactNode>
>;

interface TransactionsTableProps {
  transactions: Transaction[];
  cellRenderers?: CellRenderers;
  onSave?: (transactions: Transaction[]) => void;
}

export const TransactionsTable = ({
  transactions,
  cellRenderers,
  onSave,
}: TransactionsTableProps) => {
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    () => new Set(COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key))
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [sort, setSort] = useState<SortState | null>(null);

  const handleSort = (key: ColumnKey) => {
    if (!SORTABLE_KEYS.has(key)) return;
    setSort((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const activeColumns = COLUMNS.filter((c) => visibleColumns.has(c.key));

  const hasErrors = useMemo(
    () => transactions.some(isMissing),
    [transactions]
  );

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      // Missing rows always float to the top
      const aMissing = isMissing(a) ? 0 : 1;
      const bMissing = isMissing(b) ? 0 : 1;
      if (aMissing !== bMissing) return aMissing - bMissing;

      // Then apply user-selected column sort within each group
      if (sort) {
        return compareByColumn(a, b, sort.key, sort.direction);
      }
      return 0;
    });
  }, [transactions, sort]);

  return (
    <div className="w-full flex flex-col min-h-0 flex-1">
            {/* Toolbar */}
      <div className="mb-3 flex items-center justify-between shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowColumnPicker((v) => !v)}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Columns
          </button>

          {showColumnPicker && (
            <div className="absolute left-0 top-full mt-1 z-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-3 grid gap-1 min-w-[180px]">
              {COLUMNS.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 py-1"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    className="rounded"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {onSave && (
          <button
            onClick={() => onSave(transactions)}
            disabled={hasErrors}
            className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 flex-1 min-h-0">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            {activeColumns.map((col) => {
                const isSortable = col.sortable;
                const isActive = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={isSortable ? () => handleSort(col.key) : undefined}
                    className={`px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap ${
                      isSortable
                        ? "cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100"
                        : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {isSortable && (
                        <span className={`text-xs ${isActive ? "" : "text-gray-300 dark:text-gray-600"}`}>
                          {isActive && sort?.direction === "asc" ? "\u25B2" : ""}
                          {isActive && sort?.direction === "desc" ? "\u25BC" : ""}
                          {!isActive ? "\u25B4\u25BE" : ""}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={activeColumns.length}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No transactions
                </td>
              </tr>
            ) : (
              sortedTransactions.map((txn) => (
                <tr
                  key={txn.id}
                                                      className={`transition-colors ${
                    isMissing(txn)
                      ? "bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                                    {activeColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${
                        col.key === "categories"
                          ? "whitespace-normal align-top"
                          : "whitespace-nowrap"
                      }`}
                    >
                      {cellRenderers?.[col.key]
                      ? cellRenderers[col.key]!(txn)
                      : renderCell(txn, col.key)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="shrink-0 mt-2 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        {transactions.length} {transactions.length === 1 ? "row" : "rows"}
      </div>
    </div>
  );
};
