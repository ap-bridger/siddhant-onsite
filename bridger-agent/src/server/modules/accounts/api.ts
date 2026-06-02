import { prisma } from "@/lib/db";

export type TransactionCategory = {
  id: string;
  accountId: string;
  amountCents: number;
};

// Mirrors the `Transaction` model (camelCased, JSON-friendly). The enrichment
// fields (pair/match/vendor/categories) are optional and omitted for pending
// transactions.
export type Transaction = {
  id: string;
  qboId: string | null;
  date: string;
  description: string;
  amountCents: number;
  pair?: string | null;
  match?: string | null;
  vendor?: string | null;
  categories?: TransactionCategory[];
};

export const getPendingTransactions = async (
  bankAccountId: string,
): Promise<Transaction[]> => {
  const transactions = await prisma.transaction.findMany({
    where: { bank_account_id: bankAccountId },
    select: {
      id: true,
      qbo_id: true,
      date: true,
      description: true,
      amount_cents: true,
    },
    orderBy: { date: "desc" },
  });

  return transactions.map((tx) => ({
    id: tx.id,
    qboId: tx.qbo_id,
    date: tx.date.toISOString(),
    description: tx.description,
    amountCents: tx.amount_cents,
  }));
};
