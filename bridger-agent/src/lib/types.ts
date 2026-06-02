export interface TransactionCategory {
  category: string;
  amount: number;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  pair?: string;
  vendor?: string;
  qboid: string;
  match?: string;
  categories?: TransactionCategory[];
}
