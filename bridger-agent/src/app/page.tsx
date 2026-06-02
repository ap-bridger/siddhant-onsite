"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TransactionsTable,
  CellRenderers,
} from "@/components/TransactionsTable/TransactionsTable";
import { VendorSelect } from "@/components/VendorSelect/VendorSelect";
import { CategoriesEditor } from "@/components/CategoriesEditor/CategoriesEditor";
import { Account, PredictedCategory, Transaction } from "@/lib/types";

const SAMPLE_ACCOUNTS: Account[] = [
  { id: "clx_acc_supplies", name: "Office Supplies" },
  { id: "clx_acc_tax", name: "Tax" },
  { id: "clx_acc_software", name: "Software" },
  { id: "clx_acc_travel", name: "Travel" },
  { id: "clx_acc_meals", name: "Meals & Entertainment" },
  { id: "clx_acc_revenue", name: "Revenue" },
  { id: "clx_acc_rent", name: "Rent" },
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "clx_txn_001",
    bank_account_id: "clx_ba_001",
    date: "2025-01-15T00:00:00.000Z",
    description: "Office Supplies from Staples",
    amount_cents: -12450,
    vendor: "Staples",
    qbo_id: "qbo_abc123",
    categories: [
      { id: "clx_pc_001", account_id: "clx_acc_supplies", amount_cents: -10000, transaction_id: "clx_txn_001" },
      { id: "clx_pc_002", account_id: "clx_acc_tax", amount_cents: -2450, transaction_id: "clx_txn_001" },
    ],
  },
  {
    id: "clx_txn_002",
    bank_account_id: "clx_ba_001",
    date: "2025-01-16T00:00:00.000Z",
    description: "Client Payment - Acme Corp",
    amount_cents: 500000,
    pair_id: "clx_txn_003",
    qbo_id: "qbo_def456",
    match_id: "clx_match_002",
  },
  {
    id: "clx_txn_003",
    bank_account_id: "clx_ba_001",
    date: "2025-01-17T00:00:00.000Z",
    description: "Monthly SaaS Subscription",
    amount_cents: -4999,
    vendor: "Notion",
    qbo_id: "qbo_ghi789",
    categories: [
      { id: "clx_pc_003", account_id: "clx_acc_software", amount_cents: -4999, transaction_id: "clx_txn_003" },
    ],
  },
];

export default function Home() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(SAMPLE_TRANSACTIONS);

  const handleVendorChange = (txnId: string, vendor: string | undefined) => {
    setTransactions((prev) =>
      prev.map((txn) => (txn.id === txnId ? { ...txn, vendor } : txn))
    );
  };

    const handleCategoriesSave = (
    txnId: string,
    categories: PredictedCategory[]
  ) => {
    setTransactions((prev) =>
      prev.map((txn) =>
        txn.id === txnId ? { ...txn, categories } : txn
      )
    );
  };

  const handleSave = useCallback((txns: Transaction[]) => {
    // TODO: persist to backend
    console.log("Saving transactions:", txns);
  }, []);

  const cellRenderers: CellRenderers = useMemo(
    () => ({
      vendor: (txn) => (
        <VendorSelect
          value={txn.vendor}
          onChange={(v) => handleVendorChange(txn.id, v)}
        />
      ),
      categories: (txn) => (
        <CategoriesEditor
          transactionId={txn.id}
          transactionAmountCents={txn.amount_cents}
          categories={txn.categories}
          accounts={SAMPLE_ACCOUNTS}
          onSave={handleCategoriesSave}
        />
      ),
    }),
    []
  );

      return (
    <div className="h-screen flex flex-col p-8 sm:p-12 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-6xl w-full mx-auto flex flex-col min-h-0 flex-1 gap-4">
        <h1 className="text-2xl font-bold shrink-0">Transactions</h1>
                <TransactionsTable
          transactions={transactions}
          cellRenderers={cellRenderers}
          onSave={handleSave}
        />
      </main>
    </div>
  );
}
