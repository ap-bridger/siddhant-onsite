import { getPendingTransactions } from "@/server/modules/accounts/api";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json(await getPendingTransactions(id));
}
