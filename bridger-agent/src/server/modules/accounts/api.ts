import { prisma } from "@/lib/db";

export type TransactionCategory = {
  id: string;
  accountId: string;
  amountCents: number;
};

export type Transaction = {
  id: string;
  qboId: string | null;
  date: string;
  description: string;
  amountCents: number;
  pair: string | null;
  match: string | null;
  vendor: string | null;
  categories: TransactionCategory[];
};


const missingVendorCategory = (transaction: Transaction): boolean =>
  !transaction.vendor || transaction.categories.length === 0;


export const getPendingTransactions = async (
  bankAccountId: string,
): Promise<Transaction[]> => {
  const transactions = await prisma.transaction.findMany({
    where: { bank_account_id: bankAccountId },
    include: { categories: true },
  });

  const mapped: Transaction[] = transactions.map((tx) => ({
    id: tx.id,
    qboId: tx.qbo_id,
    date: tx.date.toISOString(),
    description: tx.description,
    amountCents: tx.amount_cents,
    pair: tx.pair_id,
    match: tx.match_id,
    vendor: tx.vendor,
    categories: tx.categories.map((category) => ({
      id: category.id,
      accountId: category.account_id,
      amountCents: category.amount_cents,
    })),
  }));

  return mapped.sort((a, b) => {
    const aNeeds = missingVendorCategory(a);
    const bNeeds = missingVendorCategory(b);
    if (aNeeds !== bNeeds) {
      return aNeeds ? -1 : 1;
    }
    // ISO date strings compare lexically, so this is date descending.
    return b.date.localeCompare(a.date);
  });
};
