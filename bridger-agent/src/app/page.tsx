"use client";

import { useState, useMemo } from "react";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/client/graphql/apollo-client";
import {
  TransactionsTable,
  CellRenderers,
} from "@/components/TransactionsTable/TransactionsTable";
import { VendorSelect } from "@/components/VendorSelect/VendorSelect";
import { Transaction } from "@/lib/types";

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_001",
    date: "2025-01-15",
    description: "Office Supplies from Staples",
    amount: -124.5,
    vendor: "Staples",
    qboid: "qbo_abc123",
    categories: [
      { category: "Office Supplies", amount: -100.0 },
      { category: "Tax", amount: -24.5 },
    ],
  },
  {
    id: "txn_002",
    date: "2025-01-16",
    description: "Client Payment - Acme Corp",
    amount: 5000.0,
    pair: "inv_042",
    qboid: "qbo_def456",
    match: "match_002",
  },
  {
    id: "txn_003",
    date: "2025-01-17",
    description: "Monthly SaaS Subscription",
    amount: -49.99,
    vendor: "Notion",
    qboid: "qbo_ghi789",
    categories: [{ category: "Software", amount: -49.99 }],
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

  const cellRenderers: CellRenderers = useMemo(
    () => ({
      vendor: (txn) => (
        <VendorSelect
          value={txn.vendor}
          onChange={(v) => handleVendorChange(txn.id, v)}
        />
      ),
    }),
    []
  );

  return (
    <ApolloProvider client={apolloClient}>
      <div className="h-screen flex flex-col p-8 sm:p-12 font-[family-name:var(--font-geist-sans)]">
        <main className="max-w-6xl w-full mx-auto flex flex-col min-h-0 flex-1 gap-4">
          <h1 className="text-2xl font-bold shrink-0">Transactions</h1>
          <TransactionsTable
            transactions={transactions}
            cellRenderers={cellRenderers}
          />
        </main>
      </div>
    </ApolloProvider>
  );
}
