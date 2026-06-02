"use client";

import { useState, useMemo } from "react";
import { Account, PredictedCategory } from "@/lib/types";
import { formatCents } from "@/lib/format";
import { CategoriesList } from "@/components/CategoriesList/CategoriesList";

/** Local draft row used while editing */
interface DraftRow {
  key: string; // stable React key (not persisted)
  account_id: string;
  amount_cents: number;
}

let nextKey = 0;
function newKey(): string {
  return `draft_${nextKey++}`;
}

interface CategoriesEditorProps {
  transactionId: string;
  transactionAmountCents: number;
  categories: PredictedCategory[] | undefined;
  accounts: Account[];
  onSave: (transactionId: string, categories: PredictedCategory[]) => void;
}

export const CategoriesEditor = ({
  transactionId,
  transactionAmountCents,
  categories,
  accounts,
  onSave,
}: CategoriesEditorProps) => {
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState<DraftRow[]>([]);

  // When entering edit mode, seed draft rows from existing categories
  // or create a single default row with the full transaction amount
  const startEditing = () => {
    if (categories && categories.length > 0) {
      setRows(
        categories.map((c) => ({
          key: newKey(),
          account_id: c.account_id,
          amount_cents: c.amount_cents,
        }))
      );
    } else {
      setRows([
        {
          key: newKey(),
          account_id: "",
          amount_cents: transactionAmountCents,
        },
      ]);
    }
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setRows([]);
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { key: newKey(), account_id: "", amount_cents: 0 },
    ]);
  };

  const handleRemoveRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const updateRow = (key: string, field: Partial<DraftRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...field } : r))
    );
  };

  const totalCents = useMemo(
    () => rows.reduce((sum, r) => sum + r.amount_cents, 0),
    [rows]
  );

  const isBalanced = totalCents === transactionAmountCents;
  const allHaveAccount = rows.length > 0 && rows.every((r) => r.account_id);
  const canSave = isBalanced && allHaveAccount;

  const handleSave = () => {
    if (!canSave) return;
    const saved: PredictedCategory[] = rows.map((r) => ({
      id: newKey(), // generate a placeholder id
      account_id: r.account_id,
      amount_cents: r.amount_cents,
      transaction_id: transactionId,
    }));
    onSave(transactionId, saved);
    setEditing(false);
    setRows([]);
  };

  /* ---- View mode ---- */
  if (!editing) {
    return (
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <CategoriesList categories={categories} />
        </div>
        <button
          type="button"
          onClick={startEditing}
          className="shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Edit categories"
          title="Edit categories"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
          </svg>
        </button>
      </div>
    );
  }

  /* ---- Edit mode ---- */
  return (
    <div className="space-y-2 min-w-[320px]">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          {/* Account dropdown */}
          <select
            value={row.account_id}
            onChange={(e) =>
              updateRow(row.key, { account_id: e.target.value })
            }
            className="flex-1 min-w-0 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select account...</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Amount input (in dollars, stored as cents) */}
          <input
            type="number"
            step="0.01"
            value={(row.amount_cents / 100).toFixed(2)}
            onChange={(e) => {
              const cents = Math.round(parseFloat(e.target.value || "0") * 100);
              updateRow(row.key, { amount_cents: cents });
            }}
            className="w-28 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm font-mono text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Remove row */}
          <button
            type="button"
            onClick={() => handleRemoveRow(row.key)}
            className="shrink-0 text-gray-400 hover:text-red-500 transition-colors text-sm leading-none"
            aria-label="Remove row"
          >
            &times;
          </button>
        </div>
      ))}

      {/* Balance indicator */}
      {!isBalanced && (
        <p className="text-xs text-red-500">
          Total {formatCents(totalCents)} does not equal transaction amount{" "}
          {formatCents(transactionAmountCents)}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleAddRow}
          className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          + Add row
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
