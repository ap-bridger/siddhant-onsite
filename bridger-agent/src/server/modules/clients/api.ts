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
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
};

export const getClientVendors = async (
  clientId: string,
): Promise<Vendor[]> => {
  await assertClientExists(clientId);
  return prisma.vendor.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
};
