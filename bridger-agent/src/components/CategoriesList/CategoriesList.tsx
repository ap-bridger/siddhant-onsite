"use client";

import { PredictedCategory } from "@/lib/types";
import { formatCents } from "@/lib/format";

interface CategoriesListProps {
  categories: PredictedCategory[] | undefined;
}

export const CategoriesList = ({ categories }: CategoriesListProps) => {
  if (!categories || categories.length === 0) {
    return <span className="text-gray-400">&mdash;</span>;
  }

  return (
    <ul className="list-none m-0 p-0 space-y-0.5">
      {categories.map((c) => (
        <li key={c.id} className="flex justify-between gap-4 text-sm">
          <span className="truncate" title={c.account_id}>
            {c.account_id}
          </span>
          <span
            className={`font-mono whitespace-nowrap ${
              c.amount_cents < 0 ? "text-red-500" : "text-green-600"
            }`}
          >
            {formatCents(c.amount_cents)}
          </span>
        </li>
      ))}
    </ul>
  );
};
