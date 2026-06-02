import { prisma } from "@/lib/db";
import { GraphQLError } from "graphql";

export type Category = {
  id: string;
  name: string;
};

export type Vendor = {
  id: string;
  name: string;
};

const assertClientExists = async (clientId: string): Promise<void> => {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  });
  if (!client) {
    // GraphQLError is treated as an expected, client-safe error, so Yoga
    // surfaces the message instead of masking it as "Unexpected error.".
    throw new GraphQLError(`Client not found: ${clientId}`, {
      extensions: { code: "CLIENT_NOT_FOUND" },
    });
  }
};

export const getClientCategories = async (
  clientId: string,
): Promise<Category[]> => {
  await assertClientExists(clientId);
  return prisma.account.findMany({
    where: { client_id: clientId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
};

export const getClientVendors = async (
  clientId: string,
): Promise<Vendor[]> => {
  await assertClientExists(clientId);
  return prisma.vendor.findMany({
    where: { client_id: clientId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
};

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
  clientId: string,
): Promise<Transaction[]> => {
  await assertClientExists(clientId);

  // Filter to the client's first bank account (smallest id).
  const bankAccount = await prisma.bankAccount.findFirst({
    where: { client_id: clientId },
    orderBy: { id: "asc" },
    select: { id: true },
  });
  if (!bankAccount) {
    return [];
  }

  const transactions = await prisma.transaction.findMany({
    where: { bank_account_id: bankAccount.id },
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
