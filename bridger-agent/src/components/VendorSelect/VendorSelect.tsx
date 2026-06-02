"use client";

import { useState, useRef, useEffect, useMemo } from "react";

const VENDOR_NAMES = [
  "Amazon",
  "Stripe",
  "Delta Airlines",
  "WeWork",
  "Github",
  "Slack",
  "Uber",
  "Staples",
  "Notion",
];

interface VendorSelectProps {
  value: string | undefined;
  onChange: (vendor: string | undefined) => void;
}

export const VendorSelect = ({ value, onChange }: VendorSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build the full option list, including the current value if it's not in VENDOR_NAMES, sorted alphabetically
  const allVendors = useMemo(() => {
    const list = value && !VENDOR_NAMES.includes(value)
      ? [value, ...VENDOR_NAMES]
      : [...VENDOR_NAMES];
    return list.sort((a, b) => a.localeCompare(b));
  }, [value]);

  const filtered = allVendors.filter((v) =>
    v.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (vendor: string) => {
    onChange(vendor);
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    onChange(undefined);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input / trigger */}
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={open ? query : value ?? ""}
          placeholder="Select vendor..."
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm leading-none"
            aria-label="Clear vendor"
          >
            &times;
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <ul className="absolute left-0 top-full mt-1 z-20 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 text-sm">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-gray-400">No matches</li>
          ) : (
            filtered.map((v) => (
              <li
                key={v}
                onClick={() => handleSelect(v)}
                className={`cursor-pointer px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-gray-700 ${
                  v === value
                    ? "bg-blue-50 dark:bg-gray-700 font-medium"
                    : ""
                }`}
              >
                {v}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};
