export interface AddressDetails {
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface BusinessDetails extends AddressDetails {
  logoUrl?: string; // Base64 data URL
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  totalAmount: string; // Keep as string for flexibility/currency symbols
  customer: AddressDetails;
  business: BusinessDetails; // Each invoice can theoretically have different business details, but we'll default from a global state
}

export interface AIExtractionResponse {
  business?: Partial<AddressDetails>;
  customer?: Partial<AddressDetails>;
  invoiceNumber?: string;
  date?: string;
  totalAmount?: string;
}

export interface MongoConfig {
  apiKey: string;
  endpoint: string;
  dataSource: string;
  database: string;
  collection: string;
}
