"use client";

import { useState, useMemo } from "react";
import { Transaction } from "@/lib/types";

/** Every possible column key */
type ColumnKey =
  | "id"
  | "date"
  | "description"
  | "amount"
  | "pair"
  | "vendor"
  | "qboid"
  | "match"
  | "categories";

interface ColumnDef {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
}

const COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", defaultVisible: false },
  { key: "date", label: "Date", defaultVisible: true },
  { key: "description", label: "Description", defaultVisible: true },
  { key: "amount", label: "Amount", defaultVisible: true },
  { key: "pair", label: "Pair", defaultVisible: true },
  { key: "vendor", label: "Vendor", defaultVisible: true },
  { key: "qboid", label: "QBO ID", defaultVisible: false },
  { key: "match", label: "Match", defaultVisible: false },
  { key: "categories", label: "Categories", defaultVisible: true },
];

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function renderCell(txn: Transaction, key: ColumnKey): React.ReactNode {
  switch (key) {
    case "id":
      return <span className="font-mono text-xs">{txn.id}</span>;
    case "date":
      return txn.date;
    case "description":
      return txn.description;
    case "amount":
      return (
        <span className={txn.amount < 0 ? "text-red-500" : "text-green-600"}>
          {formatCurrency(txn.amount)}
        </span>
      );
    case "pair":
      return txn.pair ?? <span className="text-gray-400">&mdash;</span>;
    case "vendor":
      return txn.vendor ?? <span className="text-gray-400">&mdash;</span>;
    case "qboid":
      return <span className="font-mono text-xs">{txn.qboid}</span>;
    case "match":
      return txn.match ?? <span className="text-gray-400">&mdash;</span>;
    case "categories":
      if (!txn.categories || txn.categories.length === 0) {
        return <span className="text-gray-400">&mdash;</span>;
      }
      return (
        <ul className="list-none m-0 p-0 space-y-0.5">
          {txn.categories.map((c, i) => (
            <li key={i} className="flex justify-between gap-3 text-sm">
              <span>{c.category}</span>
              <span className="font-mono">{formatCurrency(c.amount)}</span>
            </li>
          ))}
        </ul>
      );
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
}

export const TransactionsTable = ({
  transactions,
  cellRenderers,
}: TransactionsTableProps) => {
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    () => new Set(COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key))
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);

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

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const aMissing = !a.vendor ? 0 : 1;
      const bMissing = !b.vendor ? 0 : 1;
      return aMissing - bMissing;
    });
  }, [transactions]);

  return (
    <div className="w-full flex flex-col min-h-0 flex-1">
      {/* Column-picker toggle */}
      <div className="mb-3 relative shrink-0">
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

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 flex-1 min-h-0">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
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
                    !txn.vendor
                      ? "bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {activeColumns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 whitespace-nowrap"
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
