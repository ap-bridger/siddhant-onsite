export type Vendor = {
  id: string;
  name: string;
};

// QuickBooks-style chart-of-accounts categories. Static placeholder data for now.
const QUICKBOOKS_CATEGORIES = [
  "Advertising",
  "Bank Charges",
  "Commissions and Fees",
  "Contract Labor",
  "Cost of Goods Sold",
  "Depreciation",
  "Dues and Subscriptions",
  "Equipment Rental",
  "Insurance",
  "Interest Expense",
  "Legal and Professional Fees",
  "Meals and Entertainment",
  "Office Supplies",
  "Payroll Expenses",
  "Rent or Lease",
  "Repairs and Maintenance",
  "Taxes and Licenses",
  "Travel",
  "Utilities",
  "Wages",
];

// Static placeholder vendors for now.
const VENDORS: Vendor[] = [
  { id: "vendor_1", name: "Acme Office Supplies" },
  { id: "vendor_2", name: "Bluewave Utilities" },
  { id: "vendor_3", name: "Cornerstone Legal LLP" },
  { id: "vendor_4", name: "Delta Freight & Logistics" },
  { id: "vendor_5", name: "Evergreen Cleaning Services" },
  { id: "vendor_6", name: "Fairview Insurance Group" },
  { id: "vendor_7", name: "Granite State Hardware" },
  { id: "vendor_8", name: "Harborview Catering" },
];

// `clientId` is unused for now — placeholder until per-client data is wired up.
export const getClientCategories = async (
  _clientId: string,
): Promise<string[]> => {
  return QUICKBOOKS_CATEGORIES;
};

export const getClientVendors = async (
  _clientId: string,
): Promise<Vendor[]> => {
  return VENDORS;
};
