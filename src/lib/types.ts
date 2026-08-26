export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  mobileNumber: string;
  address?: string;
  country: string;
  stateProvince: string;
  postalCode: string;
  settings: ClientSettings;
  status: "Active" | "Inactive";
  createdAt: string;
};

export type ClientSettings = {
  sendPaymentReminders: boolean;
  chargeLateFees: boolean;
  currencyAndLanguage: "USD, English"; // Hardcoded for prototype
  invoiceAttachments: boolean;
};
