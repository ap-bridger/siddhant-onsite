type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
};

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: "TXN-1001", date: "2026-05-28", description: "Whole Foods Market", category: "Groceries", amount: -84.32 },
  { id: "TXN-1002", date: "2026-05-29", description: "Payroll Deposit - Bridger GP", category: "Income", amount: 4200.0 },
  { id: "TXN-1003", date: "2026-05-29", description: "Shell Gas Station", category: "Transport", amount: -52.18 },
  { id: "TXN-1004", date: "2026-05-30", description: "Netflix Subscription", category: "Entertainment", amount: -15.99 },
  { id: "TXN-1005", date: "2026-05-30", description: "Transfer to Savings", category: "Transfer", amount: -500.0 },
  { id: "TXN-1006", date: "2026-05-31", description: "Starbucks", category: "Dining", amount: -6.75 },
  { id: "TXN-1007", date: "2026-06-01", description: "Amazon Order #114-228", category: "Shopping", amount: -129.4 },
  { id: "TXN-1008", date: "2026-06-01", description: "Interest Payment", category: "Income", amount: 12.46 },
  { id: "TXN-1009", date: "2026-06-02", description: "ConEd Electric Bill", category: "Utilities", amount: -97.83 },
  { id: "TXN-1010", date: "2026-06-02", description: "Uber Ride", category: "Transport", amount: -21.5 },
];

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export const TransactionsTable = () => {
  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-lg font-semibold mb-3">Recent Bank Transactions</h2>
      <div className="overflow-x-auto border border-black/10 dark:border-white/15 rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-black/[.04] dark:bg-white/[.06] text-left">
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_TRANSACTIONS.map((txn) => (
              <tr key={txn.id} className="border-t border-black/[.06] dark:border-white/[.08]">
                <td className="px-4 py-2 whitespace-nowrap tabular-nums">{txn.date}</td>
                <td className="px-4 py-2">{txn.description}</td>
                <td className="px-4 py-2">{txn.category}</td>
                <td
                  className={`px-4 py-2 text-right tabular-nums ${
                    txn.amount < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {formatAmount(txn.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
