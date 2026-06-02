export interface Account {
  id: string;
  name: string;
}

export interface PredictedCategory {
  id: string;
  account_id: string;
  amount_cents: number;
  transaction_id: string;
}

export interface Transaction {
  id: string;
  bank_account_id: string;
  date: string; // ISO 8601 datetime
  description: string;
  amount_cents: number;
  pair_id?: string;
  vendor?: string;
  qbo_id?: string;
  match_id?: string;
  categories?: PredictedCategory[];
}
