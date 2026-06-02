export type TransactionCategory = {
  id: string;
  amount: number;
};

export type Transaction = {
  id: string;
  qboId: string;
  date: string;
  description: string;
  amount: number;
  pair?: string;
  match?: string;
  vendor?: string;
  categories?: TransactionCategory[];
};

// Static placeholder pending transactions for now. Pending transactions are
// unenriched, so they have no pair/match/vendor/categories yet.
const PENDING_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_1",
    qboId: "qbo_1001",
    date: "2026-05-28",
    description: "Office supplies restock",
    amount: 142.37,
  },
  {
    id: "txn_2",
    qboId: "qbo_1002",
    date: "2026-05-29",
    description: "Monthly electricity bill",
    amount: 318.5,
  },
  {
    id: "txn_3",
    qboId: "qbo_1003",
    date: "2026-05-30",
    description: "Contract review retainer",
    amount: 1200.0,
  },
  {
    id: "txn_4",
    qboId: "qbo_1004",
    date: "2026-05-31",
    description: "Freight shipment",
    amount: 540.25,
  },
  {
    id: "txn_5",
    qboId: "qbo_1005",
    date: "2026-06-01",
    description: "Team lunch",
    amount: 87.9,
  },
];

// `accountId` is unused for now — placeholder until per-account data is wired up.
export const getPendingTransactions = async (
  _accountId: string,
): Promise<Transaction[]> => {
  return PENDING_TRANSACTIONS;
};
