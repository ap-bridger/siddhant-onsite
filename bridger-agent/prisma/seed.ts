import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// --- Static reference data -------------------------------------------------

const CLIENT_NAMES = ["Acme Corp", "Globex LLC"];

const BANK_ACCOUNT_NAMES = ["Operating Checking", "Payroll", "Savings"];

// GL-style accounts (notably different from bank accounts) used for category
// predictions.
const ACCOUNT_NAMES = [
  "Revenue",
  "Office Supplies",
  "Software & SaaS",
  "Payroll Expense",
  "Travel",
  "Bank Fees",
];

const VENDOR_NAMES = [
  "Amazon",
  "Stripe",
  "Delta Airlines",
  "WeWork",
  "Github",
  "Slack",
  "Uber",
];

const DESCRIPTIONS = [
  "Monthly subscription",
  "Office supplies purchase",
  "Client payment received",
  "Payroll run",
  "Travel reimbursement",
  "Bank service fee",
  "Software license",
  "Refund",
  "Vendor invoice",
  "Wire transfer",
];

// --- Helpers ---------------------------------------------------------------

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

// Deterministic-ish pseudo amount so reruns look similar.
function amountCents(seed: number): number {
  const base = ((seed * 9301 + 49297) % 233280) / 233280;
  const dollars = Math.floor(base * 5000) + 5; // $5 – $5005
  const sign = seed % 3 === 0 ? -1 : 1; // some debits, some credits
  return sign * dollars * 100;
}

async function main() {
  // Idempotent: clear existing data (respecting FK order).
  await prisma.predictedCategory.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.client.deleteMany();
  await prisma.account.deleteMany();
  await prisma.vendor.deleteMany();

  // GL accounts & vendors (shared across clients).
  const accounts = await Promise.all(
    ACCOUNT_NAMES.map((name) => prisma.account.create({ data: { name } }))
  );

  await Promise.all(
    VENDOR_NAMES.map((name) => prisma.vendor.create({ data: { name } }))
  );

  let txSeed = 0;

  for (const clientName of CLIENT_NAMES) {
    const client = await prisma.client.create({ data: { name: clientName } });

    // 3 bank accounts per client.
    for (let b = 0; b < 3; b++) {
      const bankAccount = await prisma.bankAccount.create({
        data: {
          name: `${clientName} – ${BANK_ACCOUNT_NAMES[b]}`,
          client_id: client.id,
        },
      });

      // 10 transactions per bank account.
      for (let t = 0; t < 10; t++) {
        txSeed++;
        const amount = amountCents(txSeed);
        const day = (txSeed % 28) + 1;

        const tx = await prisma.transaction.create({
          data: {
            bank_account_id: bankAccount.id,
            date: new Date(Date.UTC(2026, 0, day)),
            description: pick(DESCRIPTIONS, txSeed),
            amount_cents: amount,
            // Give some transactions a (non-FK) match id and a vendor.
            match_id: t % 4 === 0 ? `match-${bankAccount.id}-${t}` : null,
            vendor: t % 2 === 0 ? pick(VENDOR_NAMES, txSeed) : null,
            qbo_id: `qbo-${txSeed}`,
            // Predicted categories: split the amount across 1–2 GL accounts.
            categories: {
              create:
                t % 5 === 0
                  ? [
                      {
                        account_id: pick(accounts, txSeed).id,
                        amount_cents: Math.round(amount / 2),
                      },
                      {
                        account_id: pick(accounts, txSeed + 1).id,
                        amount_cents: amount - Math.round(amount / 2),
                      },
                    ]
                  : [
                      {
                        account_id: pick(accounts, txSeed).id,
                        amount_cents: amount,
                      },
                    ],
            },
          },
        });

        // Pair every other transaction with its predecessor (self-relation).
        if (t % 2 === 1) {
          await prisma.transaction.update({
            where: { id: tx.id },
            data: { pair_id: prevTxId ?? undefined },
          });
        }
        prevTxId = tx.id;
      }
    }
  }

  const [clients, bankAccounts, txs, cats] = await Promise.all([
    prisma.client.count(),
    prisma.bankAccount.count(),
    prisma.transaction.count(),
    prisma.predictedCategory.count(),
  ]);

  console.log(
    `Seeded: ${clients} clients, ${bankAccounts} bank accounts, ${txs} transactions, ${cats} predicted categories.`
  );
}

let prevTxId: string | undefined;

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
