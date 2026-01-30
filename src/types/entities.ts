/**
 * Xero Entity Types
 *
 * Type definitions for Xero Accounting API entities.
 * Based on the Xero Accounting API documentation.
 */

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  /** Page number (Xero uses 1-based pagination) */
  page?: number;
  /** Where clause for filtering (Xero OData-style) */
  where?: string;
  /** Order by clause */
  order?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  hasMore: boolean;
  page?: number;
}

// =============================================================================
// Organisation
// =============================================================================

export interface Organisation {
  organisationId: string;
  name: string;
  legalName?: string;
  shortCode?: string;
  organisationType?: string;
  baseCurrency?: string;
  countryCode?: string;
  isDemoCompany?: boolean;
  salesTaxBasis?: string;
  salesTaxPeriod?: string;
  financialYearEndDay?: number;
  financialYearEndMonth?: number;
  createdDateUtc?: string;
  timezone?: string;
  organisationEntityType?: string;
  version?: string;
  lineOfBusiness?: string;
  addresses?: XeroAddress[];
  phones?: XeroPhone[];
  externalLinks?: XeroExternalLink[];
}

// =============================================================================
// Contacts
// =============================================================================

export interface XeroContact {
  contactId: string;
  contactNumber?: string;
  accountNumber?: string;
  contactStatus?: 'ACTIVE' | 'ARCHIVED' | 'GDPRREQUEST';
  name: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  bankAccountDetails?: string;
  taxNumber?: string;
  accountsReceivableTaxType?: string;
  accountsPayableTaxType?: string;
  addresses?: XeroAddress[];
  phones?: XeroPhone[];
  isSupplier?: boolean;
  isCustomer?: boolean;
  defaultCurrency?: string;
  updatedDateUtc?: string;
  contactPersons?: XeroContactPerson[];
  hasAttachments?: boolean;
  hasValidationErrors?: boolean;
  balances?: {
    accountsReceivable?: { outstanding?: number; overdue?: number };
    accountsPayable?: { outstanding?: number; overdue?: number };
  };
  paymentTerms?: XeroPaymentTerms;
  contactGroups?: XeroContactGroup[];
}

export interface XeroContactPerson {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  includeInEmails?: boolean;
}

export interface XeroContactGroup {
  contactGroupId: string;
  name: string;
  status?: 'ACTIVE' | 'DELETED';
  contacts?: XeroContact[];
}

// =============================================================================
// Accounts (Chart of Accounts)
// =============================================================================

export interface XeroAccount {
  accountId: string;
  code?: string;
  name: string;
  type: XeroAccountType;
  status?: 'ACTIVE' | 'ARCHIVED';
  description?: string;
  taxType?: string;
  class?: 'ASSET' | 'EQUITY' | 'EXPENSE' | 'LIABILITY' | 'REVENUE';
  systemAccount?: string;
  enablePaymentsToAccount?: boolean;
  showInExpenseClaims?: boolean;
  bankAccountNumber?: string;
  bankAccountType?: string;
  currencyCode?: string;
  reportingCode?: string;
  reportingCodeName?: string;
  hasAttachments?: boolean;
  updatedDateUtc?: string;
  addToWatchlist?: boolean;
}

export type XeroAccountType =
  | 'BANK'
  | 'CURRENT'
  | 'CURRLIAB'
  | 'DEPRECIATN'
  | 'DIRECTCOSTS'
  | 'EQUITY'
  | 'EXPENSE'
  | 'FIXED'
  | 'INVENTORY'
  | 'LIABILITY'
  | 'NONCURRENT'
  | 'OTHERINCOME'
  | 'OVERHEADS'
  | 'PREPAYMENT'
  | 'REVENUE'
  | 'SALES'
  | 'TERMLIAB'
  | 'PAYGLIABILITY'
  | 'SUPERANNUATIONEXPENSE'
  | 'SUPERANNUATIONLIABILITY'
  | 'WAGESEXPENSE'
  | 'WAGESPAYABLELIABILITY';

// =============================================================================
// Invoices
// =============================================================================

export interface XeroInvoice {
  invoiceId: string;
  invoiceNumber?: string;
  reference?: string;
  type: 'ACCREC' | 'ACCPAY';
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'AUTHORISED'
    | 'PAID'
    | 'VOIDED'
    | 'DELETED';
  lineAmountTypes?: 'Exclusive' | 'Inclusive' | 'NoTax';
  contact: { contactId: string; name?: string };
  date?: string;
  dueDate?: string;
  expectedPaymentDate?: string;
  plannedPaymentDate?: string;
  currencyCode?: string;
  currencyRate?: number;
  lineItems?: XeroLineItem[];
  subTotal?: number;
  totalTax?: number;
  total?: number;
  totalDiscount?: number;
  amountDue?: number;
  amountPaid?: number;
  amountCredited?: number;
  fullyPaidOnDate?: string;
  url?: string;
  brandingThemeId?: string;
  sentToContact?: boolean;
  hasAttachments?: boolean;
  hasErrors?: boolean;
  payments?: XeroPayment[];
  creditNotes?: XeroCreditNote[];
  prepayments?: XeroPrepayment[];
  overpayments?: XeroOverpayment[];
  updatedDateUtc?: string;
}

export interface XeroLineItem {
  lineItemId?: string;
  description?: string;
  quantity?: number;
  unitAmount?: number;
  itemCode?: string;
  accountCode?: string;
  taxType?: string;
  taxAmount?: number;
  lineAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  tracking?: XeroTrackingCategory[];
}

// =============================================================================
// Credit Notes
// =============================================================================

export interface XeroCreditNote {
  creditNoteId: string;
  creditNoteNumber?: string;
  reference?: string;
  type: 'ACCRECCREDIT' | 'ACCPAYCREDIT';
  status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
  contact: { contactId: string; name?: string };
  date?: string;
  currencyCode?: string;
  currencyRate?: number;
  lineItems?: XeroLineItem[];
  subTotal?: number;
  totalTax?: number;
  total?: number;
  remainingCredit?: number;
  allocations?: XeroAllocation[];
  brandingThemeId?: string;
  hasAttachments?: boolean;
  updatedDateUtc?: string;
}

export interface XeroAllocation {
  allocationId?: string;
  invoice?: { invoiceId: string; invoiceNumber?: string };
  amount: number;
  date?: string;
}

// =============================================================================
// Payments
// =============================================================================

export interface XeroPayment {
  paymentId: string;
  paymentType?: 'ACCRECPAYMENT' | 'ACCPAYPAYMENT' | 'ARCREDITPAYMENT' | 'APCREDITPAYMENT' | 'AROVERPAYMENTPAYMENT' | 'ARPREPAYMENTPAYMENT' | 'APPREPAYMENTPAYMENT' | 'APOVERPAYMENTPAYMENT';
  date?: string;
  amount?: number;
  currencyRate?: number;
  reference?: string;
  isReconciled?: boolean;
  status?: 'AUTHORISED' | 'DELETED';
  invoice?: { invoiceId: string; invoiceNumber?: string };
  creditNote?: { creditNoteId: string; creditNoteNumber?: string };
  prepayment?: { prepaymentId: string };
  overpayment?: { overpaymentId: string };
  account?: { accountId: string; code?: string };
  updatedDateUtc?: string;
}

// =============================================================================
// Bank Transactions
// =============================================================================

export interface XeroBankTransaction {
  bankTransactionId: string;
  type:
    | 'RECEIVE'
    | 'RECEIVE-OVERPAYMENT'
    | 'RECEIVE-PREPAYMENT'
    | 'SPEND'
    | 'SPEND-OVERPAYMENT'
    | 'SPEND-PREPAYMENT'
    | 'RECEIVE-TRANSFER'
    | 'SPEND-TRANSFER';
  status?: 'AUTHORISED' | 'DELETED';
  contact?: { contactId: string; name?: string };
  date?: string;
  lineItems?: XeroLineItem[];
  bankAccount: { accountId: string; code?: string; name?: string };
  isReconciled?: boolean;
  reference?: string;
  currencyCode?: string;
  currencyRate?: number;
  url?: string;
  subTotal?: number;
  totalTax?: number;
  total?: number;
  prepaymentId?: string;
  overpaymentId?: string;
  hasAttachments?: boolean;
  updatedDateUtc?: string;
}

// =============================================================================
// Bank Transfers
// =============================================================================

export interface XeroBankTransfer {
  bankTransferId: string;
  fromBankAccount: { accountId: string; code?: string; name?: string };
  toBankAccount: { accountId: string; code?: string; name?: string };
  amount: number;
  date?: string;
  currencyRate?: number;
  fromBankTransactionId?: string;
  toBankTransactionId?: string;
  hasAttachments?: boolean;
  createdDateUtc?: string;
}

// =============================================================================
// Items
// =============================================================================

export interface XeroItem {
  itemId: string;
  code: string;
  name?: string;
  description?: string;
  purchaseDescription?: string;
  purchaseDetails?: {
    unitPrice?: number;
    accountCode?: string;
    cogsAccountCode?: string;
    taxType?: string;
  };
  salesDetails?: {
    unitPrice?: number;
    accountCode?: string;
    taxType?: string;
  };
  isTrackedAsInventory?: boolean;
  inventoryAssetAccountCode?: string;
  totalCostPool?: number;
  quantityOnHand?: number;
  isSold?: boolean;
  isPurchased?: boolean;
  updatedDateUtc?: string;
}

// =============================================================================
// Purchase Orders
// =============================================================================

export interface XeroPurchaseOrder {
  purchaseOrderId: string;
  purchaseOrderNumber?: string;
  reference?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'BILLED' | 'DELETED';
  contact: { contactId: string; name?: string };
  date?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  attentionTo?: string;
  telephone?: string;
  deliveryInstructions?: string;
  expectedArrivalDate?: string;
  currencyCode?: string;
  currencyRate?: number;
  lineItems?: XeroLineItem[];
  subTotal?: number;
  totalTax?: number;
  total?: number;
  totalDiscount?: number;
  hasAttachments?: boolean;
  updatedDateUtc?: string;
}

// =============================================================================
// Quotes
// =============================================================================

export interface XeroQuote {
  quoteId: string;
  quoteNumber?: string;
  reference?: string;
  status: 'DRAFT' | 'SENT' | 'DECLINED' | 'ACCEPTED' | 'INVOICED' | 'DELETED';
  contact: { contactId: string; name?: string };
  date?: string;
  expiryDate?: string;
  currencyCode?: string;
  currencyRate?: number;
  lineItems?: XeroLineItem[];
  subTotal?: number;
  totalTax?: number;
  total?: number;
  totalDiscount?: number;
  title?: string;
  summary?: string;
  terms?: string;
  brandingThemeId?: string;
  updatedDateUtc?: string;
}

// =============================================================================
// Prepayments & Overpayments
// =============================================================================

export interface XeroPrepayment {
  prepaymentId: string;
  type: 'RECEIVE-PREPAYMENT' | 'SPEND-PREPAYMENT';
  contact?: { contactId: string; name?: string };
  date?: string;
  status?: 'AUTHORISED' | 'PAID' | 'VOIDED';
  lineAmountTypes?: 'Exclusive' | 'Inclusive' | 'NoTax';
  lineItems?: XeroLineItem[];
  subTotal?: number;
  totalTax?: number;
  total?: number;
  remainingCredit?: number;
  allocations?: XeroAllocation[];
  currencyCode?: string;
  currencyRate?: number;
  hasAttachments?: boolean;
  updatedDateUtc?: string;
}

export interface XeroOverpayment {
  overpaymentId: string;
  type: 'RECEIVE-OVERPAYMENT' | 'SPEND-OVERPAYMENT';
  contact?: { contactId: string; name?: string };
  date?: string;
  status?: 'AUTHORISED' | 'PAID' | 'VOIDED';
  lineAmountTypes?: 'Exclusive' | 'Inclusive' | 'NoTax';
  lineItems?: XeroLineItem[];
  subTotal?: number;
  totalTax?: number;
  total?: number;
  remainingCredit?: number;
  allocations?: XeroAllocation[];
  currencyCode?: string;
  currencyRate?: number;
  hasAttachments?: boolean;
  updatedDateUtc?: string;
}

// =============================================================================
// Journals
// =============================================================================

export interface XeroJournal {
  journalId: string;
  journalDate?: string;
  journalNumber?: number;
  createdDateUtc?: string;
  reference?: string;
  sourceId?: string;
  sourceType?: string;
  journalLines?: XeroJournalLine[];
}

export interface XeroJournalLine {
  journalLineId?: string;
  accountId?: string;
  accountCode?: string;
  accountType?: string;
  accountName?: string;
  description?: string;
  netAmount?: number;
  grossAmount?: number;
  taxAmount?: number;
  taxType?: string;
  taxName?: string;
  tracking?: XeroTrackingCategory[];
}

// =============================================================================
// Manual Journals
// =============================================================================

export interface XeroManualJournal {
  manualJournalId: string;
  date?: string;
  status?: 'DRAFT' | 'POSTED' | 'DELETED' | 'VOIDED';
  narration: string;
  lineAmountTypes?: 'Exclusive' | 'Inclusive' | 'NoTax';
  journalLines?: XeroManualJournalLine[];
  url?: string;
  showOnCashBasisReports?: boolean;
  hasAttachments?: boolean;
  updatedDateUtc?: string;
}

export interface XeroManualJournalLine {
  lineAmount: number;
  accountCode: string;
  accountId?: string;
  description?: string;
  taxType?: string;
  taxAmount?: number;
  tracking?: XeroTrackingCategory[];
  isBlank?: boolean;
}

// =============================================================================
// Batch Payments
// =============================================================================

export interface XeroBatchPayment {
  batchPaymentId: string;
  account?: { accountId: string; code?: string };
  particulars?: string;
  code?: string;
  reference?: string;
  date?: string;
  type?: 'PAYBATCH' | 'RECBATCH';
  status?: 'AUTHORISED' | 'DELETED';
  totalAmount?: number;
  isReconciled?: boolean;
  payments?: XeroPayment[];
  updatedDateUtc?: string;
}

// =============================================================================
// Tax Rates
// =============================================================================

export interface XeroTaxRate {
  name: string;
  taxType?: string;
  taxComponents?: XeroTaxComponent[];
  status?: 'ACTIVE' | 'DELETED' | 'ARCHIVED';
  reportTaxType?:
    | 'OUTPUT'
    | 'INPUT'
    | 'EXEMPTOUTPUT'
    | 'EXEMPTINPUT'
    | 'BASEXCLUDED'
    | 'GSTONIMPORTS'
    | 'ECACQUISITIONS'
    | 'CAPITALSALESOUTPUT'
    | 'CAPITALEXPENSESINPUT'
    | 'ECOUTPUT'
    | 'ECOUTPUTSERVICES';
  canApplyToAssets?: boolean;
  canApplyToEquity?: boolean;
  canApplyToExpenses?: boolean;
  canApplyToLiabilities?: boolean;
  canApplyToRevenue?: boolean;
  displayTaxRate?: number;
  effectiveRate?: number;
}

export interface XeroTaxComponent {
  name?: string;
  rate?: number;
  isCompound?: boolean;
  isNonRecoverable?: boolean;
}

// =============================================================================
// Currencies
// =============================================================================

export interface XeroCurrency {
  code: string;
  description?: string;
}

// =============================================================================
// Tracking Categories
// =============================================================================

export interface XeroTrackingCategory {
  trackingCategoryId: string;
  trackingOptionId?: string;
  name?: string;
  option?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  options?: XeroTrackingOption[];
}

export interface XeroTrackingOption {
  trackingOptionId: string;
  name: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
}

// =============================================================================
// Branding Themes
// =============================================================================

export interface XeroBrandingTheme {
  brandingThemeId: string;
  name: string;
  logoUrl?: string;
  type?: 'INVOICE' | 'QUOTE' | 'PURCHASEORDER' | 'CREDIENOTE' | 'ALL';
  sortOrder?: number;
  createdDateUtc?: string;
}

// =============================================================================
// Repeating Invoices
// =============================================================================

export interface XeroRepeatingInvoice {
  repeatingInvoiceId: string;
  type: 'ACCREC' | 'ACCPAY';
  reference?: string;
  hasAttachments?: boolean;
  contact: { contactId: string; name?: string };
  schedule?: {
    period?: number;
    unit?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    dueDate?: number;
    dueDateType?: 'DAYSAFTERBILLDATE' | 'DAYSAFTERBILLMONTH' | 'OFCURRENTMONTH' | 'OFFOLLOWINGMONTH';
    startDate?: string;
    nextScheduledDate?: string;
    endDate?: string;
  };
  lineItems?: XeroLineItem[];
  lineAmountTypes?: 'Exclusive' | 'Inclusive' | 'NoTax';
  status?: 'DRAFT' | 'AUTHORISED' | 'DELETED';
  subTotal?: number;
  totalTax?: number;
  total?: number;
  currencyCode?: string;
  brandingThemeId?: string;
  approvedForSending?: boolean;
  sendCopy?: boolean;
  markAsSent?: boolean;
  includePdf?: boolean;
}

// =============================================================================
// Users
// =============================================================================

export interface XeroUser {
  userId: string;
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  updatedDateUtc?: string;
  isSubscriber?: boolean;
  organisationRole?: 'READONLY' | 'INVOICEONLY' | 'STANDARD' | 'FINANCIALADVISER' | 'MANAGEDCLIENT' | 'CASHBOOKCLIENT' | 'UNKNOWN';
}

// =============================================================================
// Linked Transactions (Billable Expenses)
// =============================================================================

export interface XeroLinkedTransaction {
  linkedTransactionId: string;
  sourceTransactionId?: string;
  sourceLineItemId?: string;
  sourceTransactionTypeCode?: 'ACCPAY' | 'SPEND';
  contactId?: string;
  targetTransactionId?: string;
  targetLineItemId?: string;
  status?: 'DRAFT' | 'APPROVED' | 'ONDRAFT' | 'BILLED' | 'VOIDED';
  type?: 'BILLABLEEXPENSE';
  updatedDateUtc?: string;
}

// =============================================================================
// Reports
// =============================================================================

export interface XeroReport {
  reportId?: string;
  reportName?: string;
  reportType?: string;
  reportTitles?: string[];
  reportDate?: string;
  updatedDateUtc?: string;
  rows?: XeroReportRow[];
}

export interface XeroReportRow {
  rowType?: 'Header' | 'Section' | 'Row' | 'SummaryRow';
  title?: string;
  cells?: XeroReportCell[];
  rows?: XeroReportRow[];
}

export interface XeroReportCell {
  value?: string;
  attributes?: { value?: string; id?: string }[];
}

// =============================================================================
// Common Types
// =============================================================================

export interface XeroAddress {
  addressType?: 'POBOX' | 'STREET' | 'DELIVERY';
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  attentionTo?: string;
}

export interface XeroPhone {
  phoneType?: 'DEFAULT' | 'DDI' | 'MOBILE' | 'FAX';
  phoneNumber?: string;
  phoneAreaCode?: string;
  phoneCountryCode?: string;
}

export interface XeroExternalLink {
  linkType?: 'Facebook' | 'GooglePlus' | 'LinkedIn' | 'Twitter' | 'Website';
  url?: string;
}

export interface XeroPaymentTerms {
  bills?: { day?: number; type?: 'DAYSAFTERBILLDATE' | 'DAYSAFTERBILLMONTH' | 'OFCURRENTMONTH' | 'OFFOLLOWINGMONTH' };
  sales?: { day?: number; type?: 'DAYSAFTERBILLDATE' | 'DAYSAFTERBILLMONTH' | 'OFCURRENTMONTH' | 'OFFOLLOWINGMONTH' };
}

export interface XeroHistoryRecord {
  dateUtc?: string;
  dateUtcString?: string;
  user?: string;
  changes?: string;
  details?: string;
}

// =============================================================================
// API Response Wrappers
// =============================================================================

export interface XeroApiResponse<T> {
  Id?: string;
  Status?: string;
  ProviderName?: string;
  DateTimeUTC?: string;
  [key: string]: T | T[] | string | undefined;
}
