/**
 * Xero Accounting API Client
 *
 * This file handles all HTTP communication with the Xero Accounting API.
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different OAuth tokens.
 *
 * API Reference: https://developer.xero.com/documentation/api/accounting/overview
 */

import type {
  Organisation,
  PaginationParams,
  PaginatedResponse,
  XeroAccount,
  XeroAccountType,
  XeroBankTransaction,
  XeroBankTransfer,
  XeroBatchPayment,
  XeroBrandingTheme,
  XeroContact,
  XeroContactGroup,
  XeroCreditNote,
  XeroCurrency,
  XeroInvoice,
  XeroItem,
  XeroJournal,
  XeroLineItem,
  XeroLinkedTransaction,
  XeroManualJournal,
  XeroOverpayment,
  XeroPayment,
  XeroPrepayment,
  XeroPurchaseOrder,
  XeroQuote,
  XeroRepeatingInvoice,
  XeroReport,
  XeroTaxRate,
  XeroTrackingCategory,
  XeroUser,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import { AuthenticationError, CrmApiError, RateLimitError } from './utils/errors.js';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = 'https://api.xero.com/api.xro/2.0';

// Rate limit: 60 calls per minute per tenant

// =============================================================================
// Xero Client Interface
// =============================================================================

export interface XeroClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // Organisation
  getOrganisation(): Promise<Organisation>;

  // Contacts
  listContacts(params?: PaginationParams & { includeArchived?: boolean }): Promise<PaginatedResponse<XeroContact>>;
  getContact(contactId: string): Promise<XeroContact>;
  createContact(contact: Partial<XeroContact>): Promise<XeroContact>;
  updateContact(contactId: string, contact: Partial<XeroContact>): Promise<XeroContact>;
  archiveContact(contactId: string): Promise<XeroContact>;

  // Contact Groups
  listContactGroups(): Promise<XeroContactGroup[]>;
  getContactGroup(contactGroupId: string): Promise<XeroContactGroup>;
  createContactGroup(name: string): Promise<XeroContactGroup>;
  updateContactGroup(contactGroupId: string, name: string): Promise<XeroContactGroup>;
  deleteContactGroup(contactGroupId: string): Promise<void>;
  addContactsToGroup(contactGroupId: string, contactIds: string[]): Promise<XeroContactGroup>;
  removeContactsFromGroup(contactGroupId: string, contactId: string): Promise<void>;

  // Accounts
  listAccounts(params?: { where?: string; classType?: string }): Promise<XeroAccount[]>;
  getAccount(accountId: string): Promise<XeroAccount>;
  createAccount(account: Partial<XeroAccount>): Promise<XeroAccount>;
  updateAccount(accountId: string, account: Partial<XeroAccount>): Promise<XeroAccount>;
  archiveAccount(accountId: string): Promise<XeroAccount>;
  deleteAccount(accountId: string): Promise<void>;

  // Invoices
  listInvoices(params?: PaginationParams & { statuses?: string[] }): Promise<PaginatedResponse<XeroInvoice>>;
  getInvoice(invoiceId: string): Promise<XeroInvoice>;
  createInvoice(invoice: Partial<XeroInvoice>): Promise<XeroInvoice>;
  updateInvoice(invoiceId: string, invoice: Partial<XeroInvoice>): Promise<XeroInvoice>;
  voidInvoice(invoiceId: string): Promise<XeroInvoice>;
  deleteInvoice(invoiceId: string): Promise<void>;

  // Credit Notes
  listCreditNotes(params?: PaginationParams): Promise<PaginatedResponse<XeroCreditNote>>;
  getCreditNote(creditNoteId: string): Promise<XeroCreditNote>;
  createCreditNote(creditNote: Partial<XeroCreditNote>): Promise<XeroCreditNote>;
  updateCreditNote(creditNoteId: string, creditNote: Partial<XeroCreditNote>): Promise<XeroCreditNote>;
  allocateCreditNote(creditNoteId: string, invoiceId: string, amount: number, date?: string): Promise<XeroCreditNote>;
  voidCreditNote(creditNoteId: string): Promise<XeroCreditNote>;

  // Payments
  listPayments(params?: PaginationParams): Promise<PaginatedResponse<XeroPayment>>;
  getPayment(paymentId: string): Promise<XeroPayment>;
  createPayment(payment: Partial<XeroPayment>): Promise<XeroPayment>;
  deletePayment(paymentId: string): Promise<void>;

  // Bank Transactions
  listBankTransactions(params?: PaginationParams): Promise<PaginatedResponse<XeroBankTransaction>>;
  getBankTransaction(bankTransactionId: string): Promise<XeroBankTransaction>;
  createBankTransaction(transaction: Partial<XeroBankTransaction>): Promise<XeroBankTransaction>;
  updateBankTransaction(bankTransactionId: string, transaction: Partial<XeroBankTransaction>): Promise<XeroBankTransaction>;

  // Bank Transfers
  listBankTransfers(params?: PaginationParams): Promise<PaginatedResponse<XeroBankTransfer>>;
  getBankTransfer(bankTransferId: string): Promise<XeroBankTransfer>;
  createBankTransfer(transfer: Partial<XeroBankTransfer>): Promise<XeroBankTransfer>;

  // Items
  listItems(params?: { where?: string }): Promise<XeroItem[]>;
  getItem(itemId: string): Promise<XeroItem>;
  createItem(item: Partial<XeroItem>): Promise<XeroItem>;
  updateItem(itemId: string, item: Partial<XeroItem>): Promise<XeroItem>;
  deleteItem(itemId: string): Promise<void>;

  // Purchase Orders
  listPurchaseOrders(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<XeroPurchaseOrder>>;
  getPurchaseOrder(purchaseOrderId: string): Promise<XeroPurchaseOrder>;
  createPurchaseOrder(order: Partial<XeroPurchaseOrder>): Promise<XeroPurchaseOrder>;
  updatePurchaseOrder(purchaseOrderId: string, order: Partial<XeroPurchaseOrder>): Promise<XeroPurchaseOrder>;
  deletePurchaseOrder(purchaseOrderId: string): Promise<void>;

  // Quotes
  listQuotes(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<XeroQuote>>;
  getQuote(quoteId: string): Promise<XeroQuote>;
  createQuote(quote: Partial<XeroQuote>): Promise<XeroQuote>;
  updateQuote(quoteId: string, quote: Partial<XeroQuote>): Promise<XeroQuote>;
  deleteQuote(quoteId: string): Promise<void>;

  // Prepayments
  listPrepayments(params?: PaginationParams): Promise<PaginatedResponse<XeroPrepayment>>;
  getPrepayment(prepaymentId: string): Promise<XeroPrepayment>;
  allocatePrepayment(prepaymentId: string, invoiceId: string, amount: number, date?: string): Promise<XeroPrepayment>;

  // Overpayments
  listOverpayments(params?: PaginationParams): Promise<PaginatedResponse<XeroOverpayment>>;
  getOverpayment(overpaymentId: string): Promise<XeroOverpayment>;
  allocateOverpayment(overpaymentId: string, invoiceId: string, amount: number, date?: string): Promise<XeroOverpayment>;

  // Journals
  listJournals(params?: PaginationParams & { offset?: number }): Promise<XeroJournal[]>;
  getJournal(journalId: string): Promise<XeroJournal>;

  // Manual Journals
  listManualJournals(params?: PaginationParams): Promise<PaginatedResponse<XeroManualJournal>>;
  getManualJournal(manualJournalId: string): Promise<XeroManualJournal>;
  createManualJournal(journal: Partial<XeroManualJournal>): Promise<XeroManualJournal>;
  updateManualJournal(manualJournalId: string, journal: Partial<XeroManualJournal>): Promise<XeroManualJournal>;

  // Batch Payments
  listBatchPayments(params?: PaginationParams): Promise<PaginatedResponse<XeroBatchPayment>>;
  getBatchPayment(batchPaymentId: string): Promise<XeroBatchPayment>;
  createBatchPayment(payment: Partial<XeroBatchPayment>): Promise<XeroBatchPayment>;
  deleteBatchPayment(batchPaymentId: string): Promise<void>;

  // Tax Rates
  listTaxRates(): Promise<XeroTaxRate[]>;
  getTaxRate(taxType: string): Promise<XeroTaxRate>;
  createTaxRate(taxRate: Partial<XeroTaxRate>): Promise<XeroTaxRate>;
  updateTaxRate(taxRate: Partial<XeroTaxRate>): Promise<XeroTaxRate>;

  // Currencies
  listCurrencies(): Promise<XeroCurrency[]>;
  createCurrency(code: string, description?: string): Promise<XeroCurrency>;

  // Tracking Categories
  listTrackingCategories(): Promise<XeroTrackingCategory[]>;
  getTrackingCategory(trackingCategoryId: string): Promise<XeroTrackingCategory>;
  createTrackingCategory(name: string): Promise<XeroTrackingCategory>;
  updateTrackingCategory(trackingCategoryId: string, name: string): Promise<XeroTrackingCategory>;
  deleteTrackingCategory(trackingCategoryId: string): Promise<void>;
  createTrackingOption(trackingCategoryId: string, name: string): Promise<XeroTrackingCategory>;
  updateTrackingOption(trackingCategoryId: string, trackingOptionId: string, name: string): Promise<XeroTrackingCategory>;
  deleteTrackingOption(trackingCategoryId: string, trackingOptionId: string): Promise<void>;

  // Branding Themes
  listBrandingThemes(): Promise<XeroBrandingTheme[]>;
  getBrandingTheme(brandingThemeId: string): Promise<XeroBrandingTheme>;

  // Repeating Invoices
  listRepeatingInvoices(): Promise<XeroRepeatingInvoice[]>;
  getRepeatingInvoice(repeatingInvoiceId: string): Promise<XeroRepeatingInvoice>;
  createRepeatingInvoice(invoice: Partial<XeroRepeatingInvoice>): Promise<XeroRepeatingInvoice>;
  updateRepeatingInvoice(repeatingInvoiceId: string, invoice: Partial<XeroRepeatingInvoice>): Promise<XeroRepeatingInvoice>;
  deleteRepeatingInvoice(repeatingInvoiceId: string): Promise<void>;

  // Users
  listUsers(): Promise<XeroUser[]>;
  getUser(userId: string): Promise<XeroUser>;

  // Linked Transactions
  listLinkedTransactions(params?: PaginationParams & { sourceTransactionId?: string; contactId?: string }): Promise<PaginatedResponse<XeroLinkedTransaction>>;
  getLinkedTransaction(linkedTransactionId: string): Promise<XeroLinkedTransaction>;
  createLinkedTransaction(transaction: Partial<XeroLinkedTransaction>): Promise<XeroLinkedTransaction>;
  updateLinkedTransaction(linkedTransactionId: string, transaction: Partial<XeroLinkedTransaction>): Promise<XeroLinkedTransaction>;
  deleteLinkedTransaction(linkedTransactionId: string): Promise<void>;

  // Reports
  getReport(reportName: string, params?: Record<string, string>): Promise<XeroReport>;
  getBalanceSheet(params?: { date?: string; periods?: number; timeframe?: string; trackingOptionId1?: string; trackingOptionId2?: string; standardLayout?: boolean; paymentsOnly?: boolean }): Promise<XeroReport>;
  getProfitAndLoss(params?: { fromDate?: string; toDate?: string; periods?: number; timeframe?: string; trackingCategoryId?: string; trackingOptionId?: string; trackingCategoryId2?: string; trackingOptionId2?: string; standardLayout?: boolean; paymentsOnly?: boolean }): Promise<XeroReport>;
  getTrialBalance(params?: { date?: string; paymentsOnly?: boolean }): Promise<XeroReport>;
  getBankSummary(params?: { fromDate?: string; toDate?: string }): Promise<XeroReport>;
  getAgedReceivablesByContact(params?: { contactId: string; date?: string; fromDate?: string; toDate?: string }): Promise<XeroReport>;
  getAgedPayablesByContact(params?: { contactId: string; date?: string; fromDate?: string; toDate?: string }): Promise<XeroReport>;
  getBudgetSummary(params?: { date?: string; periods?: number; timeframe?: number }): Promise<XeroReport>;
  getExecutiveSummary(params?: { date?: string }): Promise<XeroReport>;
}

// =============================================================================
// Xero Client Implementation
// =============================================================================

class XeroClientImpl implements XeroClient {
  private credentials: TenantCredentials;
  private baseUrl: string;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.baseUrl || API_BASE_URL;
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthHeaders(): Record<string, string> {
    if (!this.credentials.accessToken) {
      throw new AuthenticationError('No access token provided. Include X-Xero-Access-Token header.');
    }
    if (!this.credentials.tenantId) {
      throw new AuthenticationError('No tenant ID provided. Include X-Xero-Tenant-Id header.');
    }

    return {
      Authorization: `Bearer ${this.credentials.accessToken}`,
      'Xero-Tenant-Id': this.credentials.tenantId,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    if (response.status === 401) {
      throw new AuthenticationError('Invalid or expired access token');
    }

    if (response.status === 403) {
      throw new AuthenticationError('Access forbidden. Check tenant ID and permissions.');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Xero API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.Message) {
          message = errorJson.Message;
        } else if (errorJson.Elements) {
          const validationErrors = errorJson.Elements
            .filter((e: { ValidationErrors?: { Message: string }[] }) => e.ValidationErrors?.length)
            .flatMap((e: { ValidationErrors?: { Message: string }[] }) => e.ValidationErrors?.map((v: { Message: string }) => v.Message) || []);
          if (validationErrors.length) {
            message = validationErrors.join('; ');
          }
        }
      } catch {
        // Use default message
      }
      throw new CrmApiError(message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const data = await this.request<{ Organisations: Organisation[] }>('/Organisation');
      const org = data.Organisations[0];
      return { connected: true, message: `Connected to ${org?.name || 'Xero'}` };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Organisation
  // ===========================================================================

  async getOrganisation(): Promise<Organisation> {
    const data = await this.request<{ Organisations: Array<{
      OrganisationID: string;
      Name: string;
      LegalName?: string;
      ShortCode?: string;
      OrganisationType?: string;
      BaseCurrency?: string;
      CountryCode?: string;
      IsDemoCompany?: boolean;
      SalesTaxBasis?: string;
      SalesTaxPeriod?: string;
      FinancialYearEndDay?: number;
      FinancialYearEndMonth?: number;
      CreatedDateUTC?: string;
      Timezone?: string;
      OrganisationEntityType?: string;
      Version?: string;
      LineOfBusiness?: string;
    }> }>('/Organisation');
    const o = data.Organisations[0];
    return {
      organisationId: o.OrganisationID,
      name: o.Name,
      legalName: o.LegalName,
      shortCode: o.ShortCode,
      organisationType: o.OrganisationType,
      baseCurrency: o.BaseCurrency,
      countryCode: o.CountryCode,
      isDemoCompany: o.IsDemoCompany,
      salesTaxBasis: o.SalesTaxBasis,
      salesTaxPeriod: o.SalesTaxPeriod,
      financialYearEndDay: o.FinancialYearEndDay,
      financialYearEndMonth: o.FinancialYearEndMonth,
      createdDateUtc: o.CreatedDateUTC,
      timezone: o.Timezone,
      organisationEntityType: o.OrganisationEntityType,
      version: o.Version,
      lineOfBusiness: o.LineOfBusiness,
    };
  }

  // ===========================================================================
  // Contacts
  // ===========================================================================

  async listContacts(params?: PaginationParams & { includeArchived?: boolean }): Promise<PaginatedResponse<XeroContact>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);
    if (params?.includeArchived) queryParams.set('includeArchived', 'true');

    const queryString = queryParams.toString();
    const data = await this.request<{ Contacts: Array<Record<string, unknown>> }>(`/Contacts${queryString ? `?${queryString}` : ''}`);

    const contacts = data.Contacts.map(this.mapContact);
    return {
      items: contacts,
      count: contacts.length,
      hasMore: contacts.length >= 100,
      page: params?.page || 1,
    };
  }

  async getContact(contactId: string): Promise<XeroContact> {
    const data = await this.request<{ Contacts: Array<Record<string, unknown>> }>(`/Contacts/${contactId}`);
    return this.mapContact(data.Contacts[0]);
  }

  async createContact(contact: Partial<XeroContact>): Promise<XeroContact> {
    const data = await this.request<{ Contacts: Array<Record<string, unknown>> }>('/Contacts', {
      method: 'POST',
      body: JSON.stringify({ Contacts: [this.mapContactToXero(contact)] }),
    });
    return this.mapContact(data.Contacts[0]);
  }

  async updateContact(contactId: string, contact: Partial<XeroContact>): Promise<XeroContact> {
    const data = await this.request<{ Contacts: Array<Record<string, unknown>> }>(`/Contacts/${contactId}`, {
      method: 'POST',
      body: JSON.stringify({ Contacts: [this.mapContactToXero(contact)] }),
    });
    return this.mapContact(data.Contacts[0]);
  }

  async archiveContact(contactId: string): Promise<XeroContact> {
    return this.updateContact(contactId, { contactStatus: 'ARCHIVED' });
  }

  private mapContact(c: Record<string, unknown>): XeroContact {
    return {
      contactId: c.ContactID as string,
      contactNumber: c.ContactNumber as string | undefined,
      accountNumber: c.AccountNumber as string | undefined,
      contactStatus: c.ContactStatus as 'ACTIVE' | 'ARCHIVED' | 'GDPRREQUEST' | undefined,
      name: c.Name as string,
      firstName: c.FirstName as string | undefined,
      lastName: c.LastName as string | undefined,
      emailAddress: c.EmailAddress as string | undefined,
      bankAccountDetails: c.BankAccountDetails as string | undefined,
      taxNumber: c.TaxNumber as string | undefined,
      accountsReceivableTaxType: c.AccountsReceivableTaxType as string | undefined,
      accountsPayableTaxType: c.AccountsPayableTaxType as string | undefined,
      isSupplier: c.IsSupplier as boolean | undefined,
      isCustomer: c.IsCustomer as boolean | undefined,
      defaultCurrency: c.DefaultCurrency as string | undefined,
      updatedDateUtc: c.UpdatedDateUTC as string | undefined,
      hasAttachments: c.HasAttachments as boolean | undefined,
      hasValidationErrors: c.HasValidationErrors as boolean | undefined,
      addresses: c.Addresses as XeroContact['addresses'],
      phones: c.Phones as XeroContact['phones'],
      contactPersons: c.ContactPersons as XeroContact['contactPersons'],
      balances: c.Balances as XeroContact['balances'],
      paymentTerms: c.PaymentTerms as XeroContact['paymentTerms'],
      contactGroups: c.ContactGroups as XeroContact['contactGroups'],
    };
  }

  private mapContactToXero(contact: Partial<XeroContact>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (contact.name) result.Name = contact.name;
    if (contact.firstName) result.FirstName = contact.firstName;
    if (contact.lastName) result.LastName = contact.lastName;
    if (contact.emailAddress) result.EmailAddress = contact.emailAddress;
    if (contact.contactNumber) result.ContactNumber = contact.contactNumber;
    if (contact.accountNumber) result.AccountNumber = contact.accountNumber;
    if (contact.contactStatus) result.ContactStatus = contact.contactStatus;
    if (contact.bankAccountDetails) result.BankAccountDetails = contact.bankAccountDetails;
    if (contact.taxNumber) result.TaxNumber = contact.taxNumber;
    if (contact.accountsReceivableTaxType) result.AccountsReceivableTaxType = contact.accountsReceivableTaxType;
    if (contact.accountsPayableTaxType) result.AccountsPayableTaxType = contact.accountsPayableTaxType;
    if (contact.isSupplier !== undefined) result.IsSupplier = contact.isSupplier;
    if (contact.isCustomer !== undefined) result.IsCustomer = contact.isCustomer;
    if (contact.defaultCurrency) result.DefaultCurrency = contact.defaultCurrency;
    if (contact.addresses) result.Addresses = contact.addresses;
    if (contact.phones) result.Phones = contact.phones;
    if (contact.contactPersons) result.ContactPersons = contact.contactPersons;
    if (contact.paymentTerms) result.PaymentTerms = contact.paymentTerms;
    return result;
  }

  // ===========================================================================
  // Contact Groups
  // ===========================================================================

  async listContactGroups(): Promise<XeroContactGroup[]> {
    const data = await this.request<{ ContactGroups: Array<Record<string, unknown>> }>('/ContactGroups');
    return data.ContactGroups.map(this.mapContactGroup);
  }

  async getContactGroup(contactGroupId: string): Promise<XeroContactGroup> {
    const data = await this.request<{ ContactGroups: Array<Record<string, unknown>> }>(`/ContactGroups/${contactGroupId}`);
    return this.mapContactGroup(data.ContactGroups[0]);
  }

  async createContactGroup(name: string): Promise<XeroContactGroup> {
    const data = await this.request<{ ContactGroups: Array<Record<string, unknown>> }>('/ContactGroups', {
      method: 'PUT',
      body: JSON.stringify({ ContactGroups: [{ Name: name }] }),
    });
    return this.mapContactGroup(data.ContactGroups[0]);
  }

  async updateContactGroup(contactGroupId: string, name: string): Promise<XeroContactGroup> {
    const data = await this.request<{ ContactGroups: Array<Record<string, unknown>> }>(`/ContactGroups/${contactGroupId}`, {
      method: 'POST',
      body: JSON.stringify({ ContactGroups: [{ Name: name }] }),
    });
    return this.mapContactGroup(data.ContactGroups[0]);
  }

  async deleteContactGroup(contactGroupId: string): Promise<void> {
    await this.request(`/ContactGroups/${contactGroupId}`, {
      method: 'POST',
      body: JSON.stringify({ ContactGroups: [{ Status: 'DELETED' }] }),
    });
  }

  async addContactsToGroup(contactGroupId: string, contactIds: string[]): Promise<XeroContactGroup> {
    const data = await this.request<{ ContactGroups: Array<Record<string, unknown>> }>(`/ContactGroups/${contactGroupId}/Contacts`, {
      method: 'PUT',
      body: JSON.stringify({ Contacts: contactIds.map(id => ({ ContactID: id })) }),
    });
    return this.mapContactGroup(data.ContactGroups[0]);
  }

  async removeContactsFromGroup(contactGroupId: string, contactId: string): Promise<void> {
    await this.request(`/ContactGroups/${contactGroupId}/Contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  private mapContactGroup(cg: Record<string, unknown>): XeroContactGroup {
    return {
      contactGroupId: cg.ContactGroupID as string,
      name: cg.Name as string,
      status: cg.Status as 'ACTIVE' | 'DELETED' | undefined,
      contacts: (cg.Contacts as Array<Record<string, unknown>> | undefined)?.map(this.mapContact.bind(this)),
    };
  }

  // ===========================================================================
  // Accounts
  // ===========================================================================

  async listAccounts(params?: { where?: string; classType?: string }): Promise<XeroAccount[]> {
    const queryParams = new URLSearchParams();
    if (params?.where) queryParams.set('where', params.where);
    if (params?.classType) queryParams.set('where', `Class=="${params.classType}"`);

    const queryString = queryParams.toString();
    const data = await this.request<{ Accounts: Array<Record<string, unknown>> }>(`/Accounts${queryString ? `?${queryString}` : ''}`);

    return data.Accounts.map(this.mapAccount);
  }

  async getAccount(accountId: string): Promise<XeroAccount> {
    const data = await this.request<{ Accounts: Array<Record<string, unknown>> }>(`/Accounts/${accountId}`);
    return this.mapAccount(data.Accounts[0]);
  }

  async createAccount(account: Partial<XeroAccount>): Promise<XeroAccount> {
    const data = await this.request<{ Accounts: Array<Record<string, unknown>> }>('/Accounts', {
      method: 'PUT',
      body: JSON.stringify(this.mapAccountToXero(account)),
    });
    return this.mapAccount(data.Accounts[0]);
  }

  async updateAccount(accountId: string, account: Partial<XeroAccount>): Promise<XeroAccount> {
    const data = await this.request<{ Accounts: Array<Record<string, unknown>> }>(`/Accounts/${accountId}`, {
      method: 'POST',
      body: JSON.stringify(this.mapAccountToXero(account)),
    });
    return this.mapAccount(data.Accounts[0]);
  }

  async archiveAccount(accountId: string): Promise<XeroAccount> {
    return this.updateAccount(accountId, { status: 'ARCHIVED' });
  }

  async deleteAccount(accountId: string): Promise<void> {
    await this.request(`/Accounts/${accountId}`, { method: 'DELETE' });
  }

  private mapAccount(a: Record<string, unknown>): XeroAccount {
    return {
      accountId: a.AccountID as string,
      code: a.Code as string | undefined,
      name: a.Name as string,
      type: a.Type as XeroAccountType,
      status: a.Status as 'ACTIVE' | 'ARCHIVED' | undefined,
      description: a.Description as string | undefined,
      taxType: a.TaxType as string | undefined,
      class: a.Class as XeroAccount['class'],
      systemAccount: a.SystemAccount as string | undefined,
      enablePaymentsToAccount: a.EnablePaymentsToAccount as boolean | undefined,
      showInExpenseClaims: a.ShowInExpenseClaims as boolean | undefined,
      bankAccountNumber: a.BankAccountNumber as string | undefined,
      bankAccountType: a.BankAccountType as string | undefined,
      currencyCode: a.CurrencyCode as string | undefined,
      reportingCode: a.ReportingCode as string | undefined,
      reportingCodeName: a.ReportingCodeName as string | undefined,
      hasAttachments: a.HasAttachments as boolean | undefined,
      updatedDateUtc: a.UpdatedDateUTC as string | undefined,
      addToWatchlist: a.AddToWatchlist as boolean | undefined,
    };
  }

  private mapAccountToXero(account: Partial<XeroAccount>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (account.code) result.Code = account.code;
    if (account.name) result.Name = account.name;
    if (account.type) result.Type = account.type;
    if (account.status) result.Status = account.status;
    if (account.description) result.Description = account.description;
    if (account.taxType) result.TaxType = account.taxType;
    if (account.enablePaymentsToAccount !== undefined) result.EnablePaymentsToAccount = account.enablePaymentsToAccount;
    if (account.showInExpenseClaims !== undefined) result.ShowInExpenseClaims = account.showInExpenseClaims;
    if (account.bankAccountNumber) result.BankAccountNumber = account.bankAccountNumber;
    if (account.bankAccountType) result.BankAccountType = account.bankAccountType;
    if (account.currencyCode) result.CurrencyCode = account.currencyCode;
    if (account.addToWatchlist !== undefined) result.AddToWatchlist = account.addToWatchlist;
    return result;
  }

  // ===========================================================================
  // Invoices
  // ===========================================================================

  async listInvoices(params?: PaginationParams & { statuses?: string[] }): Promise<PaginatedResponse<XeroInvoice>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);
    if (params?.statuses) queryParams.set('Statuses', params.statuses.join(','));

    const queryString = queryParams.toString();
    const data = await this.request<{ Invoices: Array<Record<string, unknown>> }>(`/Invoices${queryString ? `?${queryString}` : ''}`);

    const invoices = data.Invoices.map(this.mapInvoice);
    return {
      items: invoices,
      count: invoices.length,
      hasMore: invoices.length >= 100,
      page: params?.page || 1,
    };
  }

  async getInvoice(invoiceId: string): Promise<XeroInvoice> {
    const data = await this.request<{ Invoices: Array<Record<string, unknown>> }>(`/Invoices/${invoiceId}`);
    return this.mapInvoice(data.Invoices[0]);
  }

  async createInvoice(invoice: Partial<XeroInvoice>): Promise<XeroInvoice> {
    const data = await this.request<{ Invoices: Array<Record<string, unknown>> }>('/Invoices', {
      method: 'POST',
      body: JSON.stringify({ Invoices: [this.mapInvoiceToXero(invoice)] }),
    });
    return this.mapInvoice(data.Invoices[0]);
  }

  async updateInvoice(invoiceId: string, invoice: Partial<XeroInvoice>): Promise<XeroInvoice> {
    const xeroInvoice = this.mapInvoiceToXero(invoice);
    xeroInvoice.InvoiceID = invoiceId;
    const data = await this.request<{ Invoices: Array<Record<string, unknown>> }>(`/Invoices/${invoiceId}`, {
      method: 'POST',
      body: JSON.stringify({ Invoices: [xeroInvoice] }),
    });
    return this.mapInvoice(data.Invoices[0]);
  }

  async voidInvoice(invoiceId: string): Promise<XeroInvoice> {
    const data = await this.request<{ Invoices: Array<Record<string, unknown>> }>(`/Invoices/${invoiceId}`, {
      method: 'POST',
      body: JSON.stringify({ Invoices: [{ InvoiceID: invoiceId, Status: 'VOIDED' }] }),
    });
    return this.mapInvoice(data.Invoices[0]);
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    await this.request(`/Invoices/${invoiceId}`, {
      method: 'POST',
      body: JSON.stringify({ Invoices: [{ InvoiceID: invoiceId, Status: 'DELETED' }] }),
    });
  }

  private mapInvoice(i: Record<string, unknown>): XeroInvoice {
    const contact = i.Contact as Record<string, unknown> | undefined;
    return {
      invoiceId: i.InvoiceID as string,
      invoiceNumber: i.InvoiceNumber as string | undefined,
      reference: i.Reference as string | undefined,
      type: i.Type as 'ACCREC' | 'ACCPAY',
      status: i.Status as XeroInvoice['status'],
      lineAmountTypes: i.LineAmountTypes as 'Exclusive' | 'Inclusive' | 'NoTax' | undefined,
      contact: {
        contactId: contact?.ContactID as string,
        name: contact?.Name as string | undefined,
      },
      date: i.Date as string | undefined,
      dueDate: i.DueDate as string | undefined,
      expectedPaymentDate: i.ExpectedPaymentDate as string | undefined,
      plannedPaymentDate: i.PlannedPaymentDate as string | undefined,
      currencyCode: i.CurrencyCode as string | undefined,
      currencyRate: i.CurrencyRate as number | undefined,
      lineItems: (i.LineItems as Array<Record<string, unknown>> | undefined)?.map(this.mapLineItem),
      subTotal: i.SubTotal as number | undefined,
      totalTax: i.TotalTax as number | undefined,
      total: i.Total as number | undefined,
      totalDiscount: i.TotalDiscount as number | undefined,
      amountDue: i.AmountDue as number | undefined,
      amountPaid: i.AmountPaid as number | undefined,
      amountCredited: i.AmountCredited as number | undefined,
      fullyPaidOnDate: i.FullyPaidOnDate as string | undefined,
      url: i.Url as string | undefined,
      brandingThemeId: i.BrandingThemeID as string | undefined,
      sentToContact: i.SentToContact as boolean | undefined,
      hasAttachments: i.HasAttachments as boolean | undefined,
      hasErrors: i.HasErrors as boolean | undefined,
      updatedDateUtc: i.UpdatedDateUTC as string | undefined,
    };
  }

  private mapLineItem(li: Record<string, unknown>): XeroLineItem {
    return {
      lineItemId: li.LineItemID as string | undefined,
      description: li.Description as string | undefined,
      quantity: li.Quantity as number | undefined,
      unitAmount: li.UnitAmount as number | undefined,
      itemCode: li.ItemCode as string | undefined,
      accountCode: li.AccountCode as string | undefined,
      taxType: li.TaxType as string | undefined,
      taxAmount: li.TaxAmount as number | undefined,
      lineAmount: li.LineAmount as number | undefined,
      discountRate: li.DiscountRate as number | undefined,
      discountAmount: li.DiscountAmount as number | undefined,
      tracking: li.Tracking as XeroLineItem['tracking'],
    };
  }

  private mapInvoiceToXero(invoice: Partial<XeroInvoice>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (invoice.type) result.Type = invoice.type;
    if (invoice.contact) result.Contact = { ContactID: invoice.contact.contactId };
    if (invoice.date) result.Date = invoice.date;
    if (invoice.dueDate) result.DueDate = invoice.dueDate;
    if (invoice.lineAmountTypes) result.LineAmountTypes = invoice.lineAmountTypes;
    if (invoice.invoiceNumber) result.InvoiceNumber = invoice.invoiceNumber;
    if (invoice.reference) result.Reference = invoice.reference;
    if (invoice.currencyCode) result.CurrencyCode = invoice.currencyCode;
    if (invoice.status) result.Status = invoice.status;
    if (invoice.brandingThemeId) result.BrandingThemeID = invoice.brandingThemeId;
    if (invoice.lineItems) {
      result.LineItems = invoice.lineItems.map(li => ({
        Description: li.description,
        Quantity: li.quantity,
        UnitAmount: li.unitAmount,
        ItemCode: li.itemCode,
        AccountCode: li.accountCode,
        TaxType: li.taxType,
        DiscountRate: li.discountRate,
        Tracking: li.tracking,
      }));
    }
    return result;
  }

  // ===========================================================================
  // Credit Notes
  // ===========================================================================

  async listCreditNotes(params?: PaginationParams): Promise<PaginatedResponse<XeroCreditNote>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);

    const queryString = queryParams.toString();
    const data = await this.request<{ CreditNotes: Array<Record<string, unknown>> }>(`/CreditNotes${queryString ? `?${queryString}` : ''}`);

    const creditNotes = data.CreditNotes.map(this.mapCreditNote.bind(this));
    return {
      items: creditNotes,
      count: creditNotes.length,
      hasMore: creditNotes.length >= 100,
      page: params?.page || 1,
    };
  }

  async getCreditNote(creditNoteId: string): Promise<XeroCreditNote> {
    const data = await this.request<{ CreditNotes: Array<Record<string, unknown>> }>(`/CreditNotes/${creditNoteId}`);
    return this.mapCreditNote(data.CreditNotes[0]);
  }

  async createCreditNote(creditNote: Partial<XeroCreditNote>): Promise<XeroCreditNote> {
    const data = await this.request<{ CreditNotes: Array<Record<string, unknown>> }>('/CreditNotes', {
      method: 'POST',
      body: JSON.stringify({ CreditNotes: [this.mapCreditNoteToXero(creditNote)] }),
    });
    return this.mapCreditNote(data.CreditNotes[0]);
  }

  async updateCreditNote(creditNoteId: string, creditNote: Partial<XeroCreditNote>): Promise<XeroCreditNote> {
    const data = await this.request<{ CreditNotes: Array<Record<string, unknown>> }>(`/CreditNotes/${creditNoteId}`, {
      method: 'POST',
      body: JSON.stringify({ CreditNotes: [this.mapCreditNoteToXero(creditNote)] }),
    });
    return this.mapCreditNote(data.CreditNotes[0]);
  }

  async allocateCreditNote(creditNoteId: string, invoiceId: string, amount: number, date?: string): Promise<XeroCreditNote> {
    const allocation: Record<string, unknown> = { Invoice: { InvoiceID: invoiceId }, Amount: amount };
    if (date) allocation.Date = date;

    const data = await this.request<{ CreditNotes: Array<Record<string, unknown>> }>(`/CreditNotes/${creditNoteId}/Allocations`, {
      method: 'PUT',
      body: JSON.stringify({ Allocations: [allocation] }),
    });
    return this.mapCreditNote(data.CreditNotes[0]);
  }

  async voidCreditNote(creditNoteId: string): Promise<XeroCreditNote> {
    const data = await this.request<{ CreditNotes: Array<Record<string, unknown>> }>(`/CreditNotes/${creditNoteId}`, {
      method: 'POST',
      body: JSON.stringify({ CreditNotes: [{ Status: 'VOIDED' }] }),
    });
    return this.mapCreditNote(data.CreditNotes[0]);
  }

  private mapCreditNote(cn: Record<string, unknown>): XeroCreditNote {
    const contact = cn.Contact as Record<string, unknown> | undefined;
    return {
      creditNoteId: cn.CreditNoteID as string,
      creditNoteNumber: cn.CreditNoteNumber as string | undefined,
      reference: cn.Reference as string | undefined,
      type: cn.Type as 'ACCRECCREDIT' | 'ACCPAYCREDIT',
      status: cn.Status as XeroCreditNote['status'],
      contact: {
        contactId: contact?.ContactID as string,
        name: contact?.Name as string | undefined,
      },
      date: cn.Date as string | undefined,
      currencyCode: cn.CurrencyCode as string | undefined,
      currencyRate: cn.CurrencyRate as number | undefined,
      lineItems: (cn.LineItems as Array<Record<string, unknown>> | undefined)?.map(this.mapLineItem),
      subTotal: cn.SubTotal as number | undefined,
      totalTax: cn.TotalTax as number | undefined,
      total: cn.Total as number | undefined,
      remainingCredit: cn.RemainingCredit as number | undefined,
      brandingThemeId: cn.BrandingThemeID as string | undefined,
      hasAttachments: cn.HasAttachments as boolean | undefined,
      updatedDateUtc: cn.UpdatedDateUTC as string | undefined,
    };
  }

  private mapCreditNoteToXero(creditNote: Partial<XeroCreditNote>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (creditNote.type) result.Type = creditNote.type;
    if (creditNote.contact) result.Contact = { ContactID: creditNote.contact.contactId };
    if (creditNote.date) result.Date = creditNote.date;
    if (creditNote.status) result.Status = creditNote.status;
    if (creditNote.reference) result.Reference = creditNote.reference;
    if (creditNote.currencyCode) result.CurrencyCode = creditNote.currencyCode;
    if (creditNote.brandingThemeId) result.BrandingThemeID = creditNote.brandingThemeId;
    if (creditNote.lineItems) {
      result.LineItems = creditNote.lineItems.map(li => ({
        Description: li.description,
        Quantity: li.quantity,
        UnitAmount: li.unitAmount,
        ItemCode: li.itemCode,
        AccountCode: li.accountCode,
        TaxType: li.taxType,
      }));
    }
    return result;
  }

  // ===========================================================================
  // Payments
  // ===========================================================================

  async listPayments(params?: PaginationParams): Promise<PaginatedResponse<XeroPayment>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);

    const queryString = queryParams.toString();
    const data = await this.request<{ Payments: Array<Record<string, unknown>> }>(`/Payments${queryString ? `?${queryString}` : ''}`);

    const payments = data.Payments.map(this.mapPayment);
    return {
      items: payments,
      count: payments.length,
      hasMore: payments.length >= 100,
      page: params?.page || 1,
    };
  }

  async getPayment(paymentId: string): Promise<XeroPayment> {
    const data = await this.request<{ Payments: Array<Record<string, unknown>> }>(`/Payments/${paymentId}`);
    return this.mapPayment(data.Payments[0]);
  }

  async createPayment(payment: Partial<XeroPayment>): Promise<XeroPayment> {
    const data = await this.request<{ Payments: Array<Record<string, unknown>> }>('/Payments', {
      method: 'PUT',
      body: JSON.stringify({ Payments: [this.mapPaymentToXero(payment)] }),
    });
    return this.mapPayment(data.Payments[0]);
  }

  async deletePayment(paymentId: string): Promise<void> {
    await this.request(`/Payments/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify({ Payments: [{ Status: 'DELETED' }] }),
    });
  }

  private mapPayment(p: Record<string, unknown>): XeroPayment {
    const invoice = p.Invoice as Record<string, unknown> | undefined;
    const account = p.Account as Record<string, unknown> | undefined;
    return {
      paymentId: p.PaymentID as string,
      paymentType: p.PaymentType as XeroPayment['paymentType'],
      date: p.Date as string | undefined,
      amount: p.Amount as number | undefined,
      currencyRate: p.CurrencyRate as number | undefined,
      reference: p.Reference as string | undefined,
      isReconciled: p.IsReconciled as boolean | undefined,
      status: p.Status as 'AUTHORISED' | 'DELETED' | undefined,
      invoice: invoice ? { invoiceId: invoice.InvoiceID as string, invoiceNumber: invoice.InvoiceNumber as string | undefined } : undefined,
      account: account ? { accountId: account.AccountID as string, code: account.Code as string | undefined } : undefined,
      updatedDateUtc: p.UpdatedDateUTC as string | undefined,
    };
  }

  private mapPaymentToXero(payment: Partial<XeroPayment>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (payment.invoice) result.Invoice = { InvoiceID: payment.invoice.invoiceId };
    if (payment.account) result.Account = { AccountID: payment.account.accountId };
    if (payment.date) result.Date = payment.date;
    if (payment.amount) result.Amount = payment.amount;
    if (payment.reference) result.Reference = payment.reference;
    if (payment.isReconciled !== undefined) result.IsReconciled = payment.isReconciled;
    return result;
  }

  // ===========================================================================
  // Bank Transactions
  // ===========================================================================

  async listBankTransactions(params?: PaginationParams): Promise<PaginatedResponse<XeroBankTransaction>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);

    const queryString = queryParams.toString();
    const data = await this.request<{ BankTransactions: Array<Record<string, unknown>> }>(`/BankTransactions${queryString ? `?${queryString}` : ''}`);

    const transactions = data.BankTransactions.map(this.mapBankTransaction.bind(this));
    return {
      items: transactions,
      count: transactions.length,
      hasMore: transactions.length >= 100,
      page: params?.page || 1,
    };
  }

  async getBankTransaction(bankTransactionId: string): Promise<XeroBankTransaction> {
    const data = await this.request<{ BankTransactions: Array<Record<string, unknown>> }>(`/BankTransactions/${bankTransactionId}`);
    return this.mapBankTransaction(data.BankTransactions[0]);
  }

  async createBankTransaction(transaction: Partial<XeroBankTransaction>): Promise<XeroBankTransaction> {
    const data = await this.request<{ BankTransactions: Array<Record<string, unknown>> }>('/BankTransactions', {
      method: 'POST',
      body: JSON.stringify({ BankTransactions: [this.mapBankTransactionToXero(transaction)] }),
    });
    return this.mapBankTransaction(data.BankTransactions[0]);
  }

  async updateBankTransaction(bankTransactionId: string, transaction: Partial<XeroBankTransaction>): Promise<XeroBankTransaction> {
    const xeroTransaction = this.mapBankTransactionToXero(transaction);
    xeroTransaction.BankTransactionID = bankTransactionId;
    const data = await this.request<{ BankTransactions: Array<Record<string, unknown>> }>(`/BankTransactions/${bankTransactionId}`, {
      method: 'POST',
      body: JSON.stringify({ BankTransactions: [xeroTransaction] }),
    });
    return this.mapBankTransaction(data.BankTransactions[0]);
  }

  private mapBankTransaction(bt: Record<string, unknown>): XeroBankTransaction {
    const contact = bt.Contact as Record<string, unknown> | undefined;
    const bankAccount = bt.BankAccount as Record<string, unknown>;
    return {
      bankTransactionId: bt.BankTransactionID as string,
      type: bt.Type as XeroBankTransaction['type'],
      status: bt.Status as 'AUTHORISED' | 'DELETED' | undefined,
      contact: contact ? { contactId: contact.ContactID as string, name: contact.Name as string | undefined } : undefined,
      date: bt.Date as string | undefined,
      lineItems: (bt.LineItems as Array<Record<string, unknown>> | undefined)?.map(this.mapLineItem),
      bankAccount: {
        accountId: bankAccount?.AccountID as string,
        code: bankAccount?.Code as string | undefined,
        name: bankAccount?.Name as string | undefined,
      },
      isReconciled: bt.IsReconciled as boolean | undefined,
      reference: bt.Reference as string | undefined,
      currencyCode: bt.CurrencyCode as string | undefined,
      currencyRate: bt.CurrencyRate as number | undefined,
      url: bt.Url as string | undefined,
      subTotal: bt.SubTotal as number | undefined,
      totalTax: bt.TotalTax as number | undefined,
      total: bt.Total as number | undefined,
      hasAttachments: bt.HasAttachments as boolean | undefined,
      updatedDateUtc: bt.UpdatedDateUTC as string | undefined,
    };
  }

  private mapBankTransactionToXero(transaction: Partial<XeroBankTransaction>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (transaction.type) result.Type = transaction.type;
    if (transaction.contact) result.Contact = { ContactID: transaction.contact.contactId };
    if (transaction.bankAccount) result.BankAccount = { AccountID: transaction.bankAccount.accountId };
    if (transaction.date) result.Date = transaction.date;
    if (transaction.reference) result.Reference = transaction.reference;
    if (transaction.currencyCode) result.CurrencyCode = transaction.currencyCode;
    if (transaction.lineItems) {
      result.LineItems = transaction.lineItems.map(li => ({
        Description: li.description,
        Quantity: li.quantity,
        UnitAmount: li.unitAmount,
        AccountCode: li.accountCode,
        TaxType: li.taxType,
      }));
    }
    return result;
  }

  // ===========================================================================
  // Bank Transfers
  // ===========================================================================

  async listBankTransfers(params?: PaginationParams): Promise<PaginatedResponse<XeroBankTransfer>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);

    const queryString = queryParams.toString();
    const data = await this.request<{ BankTransfers: Array<Record<string, unknown>> }>(`/BankTransfers${queryString ? `?${queryString}` : ''}`);

    const transfers = data.BankTransfers.map(this.mapBankTransfer);
    return {
      items: transfers,
      count: transfers.length,
      hasMore: transfers.length >= 100,
      page: params?.page || 1,
    };
  }

  async getBankTransfer(bankTransferId: string): Promise<XeroBankTransfer> {
    const data = await this.request<{ BankTransfers: Array<Record<string, unknown>> }>(`/BankTransfers/${bankTransferId}`);
    return this.mapBankTransfer(data.BankTransfers[0]);
  }

  async createBankTransfer(transfer: Partial<XeroBankTransfer>): Promise<XeroBankTransfer> {
    const data = await this.request<{ BankTransfers: Array<Record<string, unknown>> }>('/BankTransfers', {
      method: 'PUT',
      body: JSON.stringify({
        BankTransfers: [{
          FromBankAccount: { AccountID: transfer.fromBankAccount?.accountId },
          ToBankAccount: { AccountID: transfer.toBankAccount?.accountId },
          Amount: transfer.amount,
          Date: transfer.date,
        }],
      }),
    });
    return this.mapBankTransfer(data.BankTransfers[0]);
  }

  private mapBankTransfer(bt: Record<string, unknown>): XeroBankTransfer {
    const fromAccount = bt.FromBankAccount as Record<string, unknown>;
    const toAccount = bt.ToBankAccount as Record<string, unknown>;
    return {
      bankTransferId: bt.BankTransferID as string,
      fromBankAccount: {
        accountId: fromAccount?.AccountID as string,
        code: fromAccount?.Code as string | undefined,
        name: fromAccount?.Name as string | undefined,
      },
      toBankAccount: {
        accountId: toAccount?.AccountID as string,
        code: toAccount?.Code as string | undefined,
        name: toAccount?.Name as string | undefined,
      },
      amount: bt.Amount as number,
      date: bt.Date as string | undefined,
      currencyRate: bt.CurrencyRate as number | undefined,
      fromBankTransactionId: bt.FromBankTransactionID as string | undefined,
      toBankTransactionId: bt.ToBankTransactionID as string | undefined,
      hasAttachments: bt.HasAttachments as boolean | undefined,
      createdDateUtc: bt.CreatedDateUTC as string | undefined,
    };
  }

  // ===========================================================================
  // Items
  // ===========================================================================

  async listItems(params?: { where?: string }): Promise<XeroItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.where) queryParams.set('where', params.where);

    const queryString = queryParams.toString();
    const data = await this.request<{ Items: Array<Record<string, unknown>> }>(`/Items${queryString ? `?${queryString}` : ''}`);

    return data.Items.map(this.mapItem);
  }

  async getItem(itemId: string): Promise<XeroItem> {
    const data = await this.request<{ Items: Array<Record<string, unknown>> }>(`/Items/${itemId}`);
    return this.mapItem(data.Items[0]);
  }

  async createItem(item: Partial<XeroItem>): Promise<XeroItem> {
    const data = await this.request<{ Items: Array<Record<string, unknown>> }>('/Items', {
      method: 'POST',
      body: JSON.stringify({ Items: [this.mapItemToXero(item)] }),
    });
    return this.mapItem(data.Items[0]);
  }

  async updateItem(itemId: string, item: Partial<XeroItem>): Promise<XeroItem> {
    const data = await this.request<{ Items: Array<Record<string, unknown>> }>(`/Items/${itemId}`, {
      method: 'POST',
      body: JSON.stringify({ Items: [this.mapItemToXero(item)] }),
    });
    return this.mapItem(data.Items[0]);
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.request(`/Items/${itemId}`, { method: 'DELETE' });
  }

  private mapItem(i: Record<string, unknown>): XeroItem {
    const purchaseDetails = i.PurchaseDetails as Record<string, unknown> | undefined;
    const salesDetails = i.SalesDetails as Record<string, unknown> | undefined;
    return {
      itemId: i.ItemID as string,
      code: i.Code as string,
      name: i.Name as string | undefined,
      description: i.Description as string | undefined,
      purchaseDescription: i.PurchaseDescription as string | undefined,
      purchaseDetails: purchaseDetails ? {
        unitPrice: purchaseDetails.UnitPrice as number | undefined,
        accountCode: purchaseDetails.AccountCode as string | undefined,
        cogsAccountCode: purchaseDetails.COGSAccountCode as string | undefined,
        taxType: purchaseDetails.TaxType as string | undefined,
      } : undefined,
      salesDetails: salesDetails ? {
        unitPrice: salesDetails.UnitPrice as number | undefined,
        accountCode: salesDetails.AccountCode as string | undefined,
        taxType: salesDetails.TaxType as string | undefined,
      } : undefined,
      isTrackedAsInventory: i.IsTrackedAsInventory as boolean | undefined,
      inventoryAssetAccountCode: i.InventoryAssetAccountCode as string | undefined,
      totalCostPool: i.TotalCostPool as number | undefined,
      quantityOnHand: i.QuantityOnHand as number | undefined,
      isSold: i.IsSold as boolean | undefined,
      isPurchased: i.IsPurchased as boolean | undefined,
      updatedDateUtc: i.UpdatedDateUTC as string | undefined,
    };
  }

  private mapItemToXero(item: Partial<XeroItem>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (item.code) result.Code = item.code;
    if (item.name) result.Name = item.name;
    if (item.description) result.Description = item.description;
    if (item.purchaseDescription) result.PurchaseDescription = item.purchaseDescription;
    if (item.purchaseDetails) {
      result.PurchaseDetails = {
        UnitPrice: item.purchaseDetails.unitPrice,
        AccountCode: item.purchaseDetails.accountCode,
        COGSAccountCode: item.purchaseDetails.cogsAccountCode,
        TaxType: item.purchaseDetails.taxType,
      };
    }
    if (item.salesDetails) {
      result.SalesDetails = {
        UnitPrice: item.salesDetails.unitPrice,
        AccountCode: item.salesDetails.accountCode,
        TaxType: item.salesDetails.taxType,
      };
    }
    if (item.isTrackedAsInventory !== undefined) result.IsTrackedAsInventory = item.isTrackedAsInventory;
    if (item.inventoryAssetAccountCode) result.InventoryAssetAccountCode = item.inventoryAssetAccountCode;
    if (item.isSold !== undefined) result.IsSold = item.isSold;
    if (item.isPurchased !== undefined) result.IsPurchased = item.isPurchased;
    return result;
  }

  // ===========================================================================
  // Purchase Orders
  // ===========================================================================

  async listPurchaseOrders(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<XeroPurchaseOrder>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);
    if (params?.status) queryParams.set('Status', params.status);

    const queryString = queryParams.toString();
    const data = await this.request<{ PurchaseOrders: Array<Record<string, unknown>> }>(`/PurchaseOrders${queryString ? `?${queryString}` : ''}`);

    const orders = data.PurchaseOrders.map(this.mapPurchaseOrder.bind(this));
    return {
      items: orders,
      count: orders.length,
      hasMore: orders.length >= 100,
      page: params?.page || 1,
    };
  }

  async getPurchaseOrder(purchaseOrderId: string): Promise<XeroPurchaseOrder> {
    const data = await this.request<{ PurchaseOrders: Array<Record<string, unknown>> }>(`/PurchaseOrders/${purchaseOrderId}`);
    return this.mapPurchaseOrder(data.PurchaseOrders[0]);
  }

  async createPurchaseOrder(order: Partial<XeroPurchaseOrder>): Promise<XeroPurchaseOrder> {
    const data = await this.request<{ PurchaseOrders: Array<Record<string, unknown>> }>('/PurchaseOrders', {
      method: 'POST',
      body: JSON.stringify({ PurchaseOrders: [this.mapPurchaseOrderToXero(order)] }),
    });
    return this.mapPurchaseOrder(data.PurchaseOrders[0]);
  }

  async updatePurchaseOrder(purchaseOrderId: string, order: Partial<XeroPurchaseOrder>): Promise<XeroPurchaseOrder> {
    const data = await this.request<{ PurchaseOrders: Array<Record<string, unknown>> }>(`/PurchaseOrders/${purchaseOrderId}`, {
      method: 'POST',
      body: JSON.stringify({ PurchaseOrders: [this.mapPurchaseOrderToXero(order)] }),
    });
    return this.mapPurchaseOrder(data.PurchaseOrders[0]);
  }

  async deletePurchaseOrder(purchaseOrderId: string): Promise<void> {
    await this.request(`/PurchaseOrders/${purchaseOrderId}`, {
      method: 'POST',
      body: JSON.stringify({ PurchaseOrders: [{ Status: 'DELETED' }] }),
    });
  }

  private mapPurchaseOrder(po: Record<string, unknown>): XeroPurchaseOrder {
    const contact = po.Contact as Record<string, unknown> | undefined;
    return {
      purchaseOrderId: po.PurchaseOrderID as string,
      purchaseOrderNumber: po.PurchaseOrderNumber as string | undefined,
      reference: po.Reference as string | undefined,
      status: po.Status as XeroPurchaseOrder['status'],
      contact: {
        contactId: contact?.ContactID as string,
        name: contact?.Name as string | undefined,
      },
      date: po.Date as string | undefined,
      deliveryDate: po.DeliveryDate as string | undefined,
      deliveryAddress: po.DeliveryAddress as string | undefined,
      attentionTo: po.AttentionTo as string | undefined,
      telephone: po.Telephone as string | undefined,
      deliveryInstructions: po.DeliveryInstructions as string | undefined,
      expectedArrivalDate: po.ExpectedArrivalDate as string | undefined,
      currencyCode: po.CurrencyCode as string | undefined,
      currencyRate: po.CurrencyRate as number | undefined,
      lineItems: (po.LineItems as Array<Record<string, unknown>> | undefined)?.map(this.mapLineItem),
      subTotal: po.SubTotal as number | undefined,
      totalTax: po.TotalTax as number | undefined,
      total: po.Total as number | undefined,
      totalDiscount: po.TotalDiscount as number | undefined,
      hasAttachments: po.HasAttachments as boolean | undefined,
      updatedDateUtc: po.UpdatedDateUTC as string | undefined,
    };
  }

  private mapPurchaseOrderToXero(order: Partial<XeroPurchaseOrder>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (order.contact) result.Contact = { ContactID: order.contact.contactId };
    if (order.date) result.Date = order.date;
    if (order.deliveryDate) result.DeliveryDate = order.deliveryDate;
    if (order.status) result.Status = order.status;
    if (order.reference) result.Reference = order.reference;
    if (order.deliveryAddress) result.DeliveryAddress = order.deliveryAddress;
    if (order.attentionTo) result.AttentionTo = order.attentionTo;
    if (order.telephone) result.Telephone = order.telephone;
    if (order.deliveryInstructions) result.DeliveryInstructions = order.deliveryInstructions;
    if (order.currencyCode) result.CurrencyCode = order.currencyCode;
    if (order.lineItems) {
      result.LineItems = order.lineItems.map(li => ({
        Description: li.description,
        Quantity: li.quantity,
        UnitAmount: li.unitAmount,
        ItemCode: li.itemCode,
        AccountCode: li.accountCode,
        TaxType: li.taxType,
      }));
    }
    return result;
  }

  // ===========================================================================
  // Quotes
  // ===========================================================================

  async listQuotes(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<XeroQuote>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);
    if (params?.status) queryParams.set('Status', params.status);

    const queryString = queryParams.toString();
    const data = await this.request<{ Quotes: Array<Record<string, unknown>> }>(`/Quotes${queryString ? `?${queryString}` : ''}`);

    const quotes = data.Quotes.map(this.mapQuote.bind(this));
    return {
      items: quotes,
      count: quotes.length,
      hasMore: quotes.length >= 100,
      page: params?.page || 1,
    };
  }

  async getQuote(quoteId: string): Promise<XeroQuote> {
    const data = await this.request<{ Quotes: Array<Record<string, unknown>> }>(`/Quotes/${quoteId}`);
    return this.mapQuote(data.Quotes[0]);
  }

  async createQuote(quote: Partial<XeroQuote>): Promise<XeroQuote> {
    const data = await this.request<{ Quotes: Array<Record<string, unknown>> }>('/Quotes', {
      method: 'POST',
      body: JSON.stringify({ Quotes: [this.mapQuoteToXero(quote)] }),
    });
    return this.mapQuote(data.Quotes[0]);
  }

  async updateQuote(quoteId: string, quote: Partial<XeroQuote>): Promise<XeroQuote> {
    const data = await this.request<{ Quotes: Array<Record<string, unknown>> }>(`/Quotes/${quoteId}`, {
      method: 'POST',
      body: JSON.stringify({ Quotes: [this.mapQuoteToXero(quote)] }),
    });
    return this.mapQuote(data.Quotes[0]);
  }

  async deleteQuote(quoteId: string): Promise<void> {
    await this.request(`/Quotes/${quoteId}`, {
      method: 'POST',
      body: JSON.stringify({ Quotes: [{ Status: 'DELETED' }] }),
    });
  }

  private mapQuote(q: Record<string, unknown>): XeroQuote {
    const contact = q.Contact as Record<string, unknown> | undefined;
    return {
      quoteId: q.QuoteID as string,
      quoteNumber: q.QuoteNumber as string | undefined,
      reference: q.Reference as string | undefined,
      status: q.Status as XeroQuote['status'],
      contact: {
        contactId: contact?.ContactID as string,
        name: contact?.Name as string | undefined,
      },
      date: q.Date as string | undefined,
      expiryDate: q.ExpiryDate as string | undefined,
      currencyCode: q.CurrencyCode as string | undefined,
      currencyRate: q.CurrencyRate as number | undefined,
      lineItems: (q.LineItems as Array<Record<string, unknown>> | undefined)?.map(this.mapLineItem),
      subTotal: q.SubTotal as number | undefined,
      totalTax: q.TotalTax as number | undefined,
      total: q.Total as number | undefined,
      totalDiscount: q.TotalDiscount as number | undefined,
      title: q.Title as string | undefined,
      summary: q.Summary as string | undefined,
      terms: q.Terms as string | undefined,
      brandingThemeId: q.BrandingThemeID as string | undefined,
      updatedDateUtc: q.UpdatedDateUTC as string | undefined,
    };
  }

  private mapQuoteToXero(quote: Partial<XeroQuote>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (quote.contact) result.Contact = { ContactID: quote.contact.contactId };
    if (quote.date) result.Date = quote.date;
    if (quote.expiryDate) result.ExpiryDate = quote.expiryDate;
    if (quote.status) result.Status = quote.status;
    if (quote.reference) result.Reference = quote.reference;
    if (quote.title) result.Title = quote.title;
    if (quote.summary) result.Summary = quote.summary;
    if (quote.terms) result.Terms = quote.terms;
    if (quote.currencyCode) result.CurrencyCode = quote.currencyCode;
    if (quote.brandingThemeId) result.BrandingThemeID = quote.brandingThemeId;
    if (quote.lineItems) {
      result.LineItems = quote.lineItems.map(li => ({
        Description: li.description,
        Quantity: li.quantity,
        UnitAmount: li.unitAmount,
        ItemCode: li.itemCode,
        AccountCode: li.accountCode,
        TaxType: li.taxType,
        DiscountRate: li.discountRate,
      }));
    }
    return result;
  }

  // ===========================================================================
  // Prepayments
  // ===========================================================================

  async listPrepayments(params?: PaginationParams): Promise<PaginatedResponse<XeroPrepayment>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);

    const queryString = queryParams.toString();
    const data = await this.request<{ Prepayments: Array<Record<string, unknown>> }>(`/Prepayments${queryString ? `?${queryString}` : ''}`);

    const prepayments = data.Prepayments.map(this.mapPrepayment.bind(this));
    return {
      items: prepayments,
      count: prepayments.length,
      hasMore: prepayments.length >= 100,
      page: params?.page || 1,
    };
  }

  async getPrepayment(prepaymentId: string): Promise<XeroPrepayment> {
    const data = await this.request<{ Prepayments: Array<Record<string, unknown>> }>(`/Prepayments/${prepaymentId}`);
    return this.mapPrepayment(data.Prepayments[0]);
  }

  async allocatePrepayment(prepaymentId: string, invoiceId: string, amount: number, date?: string): Promise<XeroPrepayment> {
    const allocation: Record<string, unknown> = { Invoice: { InvoiceID: invoiceId }, Amount: amount };
    if (date) allocation.Date = date;

    const data = await this.request<{ Prepayments: Array<Record<string, unknown>> }>(`/Prepayments/${prepaymentId}/Allocations`, {
      method: 'PUT',
      body: JSON.stringify({ Allocations: [allocation] }),
    });
    return this.mapPrepayment(data.Prepayments[0]);
  }

  private mapPrepayment(pp: Record<string, unknown>): XeroPrepayment {
    const contact = pp.Contact as Record<string, unknown> | undefined;
    return {
      prepaymentId: pp.PrepaymentID as string,
      type: pp.Type as 'RECEIVE-PREPAYMENT' | 'SPEND-PREPAYMENT',
      contact: contact ? { contactId: contact.ContactID as string, name: contact.Name as string | undefined } : undefined,
      date: pp.Date as string | undefined,
      status: pp.Status as 'AUTHORISED' | 'PAID' | 'VOIDED' | undefined,
      lineAmountTypes: pp.LineAmountTypes as 'Exclusive' | 'Inclusive' | 'NoTax' | undefined,
      lineItems: (pp.LineItems as Array<Record<string, unknown>> | undefined)?.map(this.mapLineItem),
      subTotal: pp.SubTotal as number | undefined,
      totalTax: pp.TotalTax as number | undefined,
      total: pp.Total as number | undefined,
      remainingCredit: pp.RemainingCredit as number | undefined,
      currencyCode: pp.CurrencyCode as string | undefined,
      currencyRate: pp.CurrencyRate as number | undefined,
      hasAttachments: pp.HasAttachments as boolean | undefined,
      updatedDateUtc: pp.UpdatedDateUTC as string | undefined,
    };
  }

  // ===========================================================================
  // Overpayments
  // ===========================================================================

  async listOverpayments(params?: PaginationParams): Promise<PaginatedResponse<XeroOverpayment>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);

    const queryString = queryParams.toString();
    const data = await this.request<{ Overpayments: Array<Record<string, unknown>> }>(`/Overpayments${queryString ? `?${queryString}` : ''}`);

    const overpayments = data.Overpayments.map(this.mapOverpayment.bind(this));
    return {
      items: overpayments,
      count: overpayments.length,
      hasMore: overpayments.length >= 100,
      page: params?.page || 1,
    };
  }

  async getOverpayment(overpaymentId: string): Promise<XeroOverpayment> {
    const data = await this.request<{ Overpayments: Array<Record<string, unknown>> }>(`/Overpayments/${overpaymentId}`);
    return this.mapOverpayment(data.Overpayments[0]);
  }

  async allocateOverpayment(overpaymentId: string, invoiceId: string, amount: number, date?: string): Promise<XeroOverpayment> {
    const allocation: Record<string, unknown> = { Invoice: { InvoiceID: invoiceId }, Amount: amount };
    if (date) allocation.Date = date;

    const data = await this.request<{ Overpayments: Array<Record<string, unknown>> }>(`/Overpayments/${overpaymentId}/Allocations`, {
      method: 'PUT',
      body: JSON.stringify({ Allocations: [allocation] }),
    });
    return this.mapOverpayment(data.Overpayments[0]);
  }

  private mapOverpayment(op: Record<string, unknown>): XeroOverpayment {
    const contact = op.Contact as Record<string, unknown> | undefined;
    return {
      overpaymentId: op.OverpaymentID as string,
      type: op.Type as 'RECEIVE-OVERPAYMENT' | 'SPEND-OVERPAYMENT',
      contact: contact ? { contactId: contact.ContactID as string, name: contact.Name as string | undefined } : undefined,
      date: op.Date as string | undefined,
      status: op.Status as 'AUTHORISED' | 'PAID' | 'VOIDED' | undefined,
      lineAmountTypes: op.LineAmountTypes as 'Exclusive' | 'Inclusive' | 'NoTax' | undefined,
      lineItems: (op.LineItems as Array<Record<string, unknown>> | undefined)?.map(this.mapLineItem),
      subTotal: op.SubTotal as number | undefined,
      totalTax: op.TotalTax as number | undefined,
      total: op.Total as number | undefined,
      remainingCredit: op.RemainingCredit as number | undefined,
      currencyCode: op.CurrencyCode as string | undefined,
      currencyRate: op.CurrencyRate as number | undefined,
      hasAttachments: op.HasAttachments as boolean | undefined,
      updatedDateUtc: op.UpdatedDateUTC as string | undefined,
    };
  }

  // ===========================================================================
  // Journals (Read-only)
  // ===========================================================================

  async listJournals(params?: PaginationParams & { offset?: number }): Promise<XeroJournal[]> {
    const queryParams = new URLSearchParams();
    if (params?.offset) queryParams.set('offset', String(params.offset));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);

    const queryString = queryParams.toString();
    const data = await this.request<{ Journals: Array<Record<string, unknown>> }>(`/Journals${queryString ? `?${queryString}` : ''}`);

    return data.Journals.map(this.mapJournal);
  }

  async getJournal(journalId: string): Promise<XeroJournal> {
    const data = await this.request<{ Journals: Array<Record<string, unknown>> }>(`/Journals/${journalId}`);
    return this.mapJournal(data.Journals[0]);
  }

  private mapJournal(j: Record<string, unknown>): XeroJournal {
    return {
      journalId: j.JournalID as string,
      journalDate: j.JournalDate as string | undefined,
      journalNumber: j.JournalNumber as number | undefined,
      createdDateUtc: j.CreatedDateUTC as string | undefined,
      reference: j.Reference as string | undefined,
      sourceId: j.SourceID as string | undefined,
      sourceType: j.SourceType as string | undefined,
      journalLines: (j.JournalLines as Array<Record<string, unknown>> | undefined)?.map(jl => ({
        journalLineId: jl.JournalLineID as string | undefined,
        accountId: jl.AccountID as string | undefined,
        accountCode: jl.AccountCode as string | undefined,
        accountType: jl.AccountType as string | undefined,
        accountName: jl.AccountName as string | undefined,
        description: jl.Description as string | undefined,
        netAmount: jl.NetAmount as number | undefined,
        grossAmount: jl.GrossAmount as number | undefined,
        taxAmount: jl.TaxAmount as number | undefined,
        taxType: jl.TaxType as string | undefined,
        taxName: jl.TaxName as string | undefined,
      })),
    };
  }

  // ===========================================================================
  // Manual Journals
  // ===========================================================================

  async listManualJournals(params?: PaginationParams): Promise<PaginatedResponse<XeroManualJournal>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);

    const queryString = queryParams.toString();
    const data = await this.request<{ ManualJournals: Array<Record<string, unknown>> }>(`/ManualJournals${queryString ? `?${queryString}` : ''}`);

    const journals = data.ManualJournals.map(this.mapManualJournal);
    return {
      items: journals,
      count: journals.length,
      hasMore: journals.length >= 100,
      page: params?.page || 1,
    };
  }

  async getManualJournal(manualJournalId: string): Promise<XeroManualJournal> {
    const data = await this.request<{ ManualJournals: Array<Record<string, unknown>> }>(`/ManualJournals/${manualJournalId}`);
    return this.mapManualJournal(data.ManualJournals[0]);
  }

  async createManualJournal(journal: Partial<XeroManualJournal>): Promise<XeroManualJournal> {
    const data = await this.request<{ ManualJournals: Array<Record<string, unknown>> }>('/ManualJournals', {
      method: 'POST',
      body: JSON.stringify({ ManualJournals: [this.mapManualJournalToXero(journal)] }),
    });
    return this.mapManualJournal(data.ManualJournals[0]);
  }

  async updateManualJournal(manualJournalId: string, journal: Partial<XeroManualJournal>): Promise<XeroManualJournal> {
    const data = await this.request<{ ManualJournals: Array<Record<string, unknown>> }>(`/ManualJournals/${manualJournalId}`, {
      method: 'POST',
      body: JSON.stringify({ ManualJournals: [this.mapManualJournalToXero(journal)] }),
    });
    return this.mapManualJournal(data.ManualJournals[0]);
  }

  private mapManualJournal(mj: Record<string, unknown>): XeroManualJournal {
    return {
      manualJournalId: mj.ManualJournalID as string,
      date: mj.Date as string | undefined,
      status: mj.Status as 'DRAFT' | 'POSTED' | 'DELETED' | 'VOIDED' | undefined,
      narration: mj.Narration as string,
      lineAmountTypes: mj.LineAmountTypes as 'Exclusive' | 'Inclusive' | 'NoTax' | undefined,
      journalLines: (mj.JournalLines as Array<Record<string, unknown>> | undefined)?.map(jl => ({
        lineAmount: jl.LineAmount as number,
        accountCode: jl.AccountCode as string,
        accountId: jl.AccountID as string | undefined,
        description: jl.Description as string | undefined,
        taxType: jl.TaxType as string | undefined,
        taxAmount: jl.TaxAmount as number | undefined,
      })),
      url: mj.Url as string | undefined,
      showOnCashBasisReports: mj.ShowOnCashBasisReports as boolean | undefined,
      hasAttachments: mj.HasAttachments as boolean | undefined,
      updatedDateUtc: mj.UpdatedDateUTC as string | undefined,
    };
  }

  private mapManualJournalToXero(journal: Partial<XeroManualJournal>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (journal.narration) result.Narration = journal.narration;
    if (journal.date) result.Date = journal.date;
    if (journal.status) result.Status = journal.status;
    if (journal.lineAmountTypes) result.LineAmountTypes = journal.lineAmountTypes;
    if (journal.showOnCashBasisReports !== undefined) result.ShowOnCashBasisReports = journal.showOnCashBasisReports;
    if (journal.journalLines) {
      result.JournalLines = journal.journalLines.map(jl => ({
        LineAmount: jl.lineAmount,
        AccountCode: jl.accountCode,
        Description: jl.description,
        TaxType: jl.taxType,
      }));
    }
    return result;
  }

  // ===========================================================================
  // Batch Payments
  // ===========================================================================

  async listBatchPayments(params?: PaginationParams): Promise<PaginatedResponse<XeroBatchPayment>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.order) queryParams.set('order', params.order);

    const queryString = queryParams.toString();
    const data = await this.request<{ BatchPayments: Array<Record<string, unknown>> }>(`/BatchPayments${queryString ? `?${queryString}` : ''}`);

    const batchPayments = data.BatchPayments.map(this.mapBatchPayment);
    return {
      items: batchPayments,
      count: batchPayments.length,
      hasMore: batchPayments.length >= 100,
      page: params?.page || 1,
    };
  }

  async getBatchPayment(batchPaymentId: string): Promise<XeroBatchPayment> {
    const data = await this.request<{ BatchPayments: Array<Record<string, unknown>> }>(`/BatchPayments/${batchPaymentId}`);
    return this.mapBatchPayment(data.BatchPayments[0]);
  }

  async createBatchPayment(payment: Partial<XeroBatchPayment>): Promise<XeroBatchPayment> {
    const data = await this.request<{ BatchPayments: Array<Record<string, unknown>> }>('/BatchPayments', {
      method: 'PUT',
      body: JSON.stringify({ BatchPayments: [this.mapBatchPaymentToXero(payment)] }),
    });
    return this.mapBatchPayment(data.BatchPayments[0]);
  }

  async deleteBatchPayment(batchPaymentId: string): Promise<void> {
    await this.request(`/BatchPayments/${batchPaymentId}`, {
      method: 'POST',
      body: JSON.stringify({ BatchPayments: [{ Status: 'DELETED' }] }),
    });
  }

  private mapBatchPayment(bp: Record<string, unknown>): XeroBatchPayment {
    const account = bp.Account as Record<string, unknown> | undefined;
    return {
      batchPaymentId: bp.BatchPaymentID as string,
      account: account ? { accountId: account.AccountID as string, code: account.Code as string | undefined } : undefined,
      particulars: bp.Particulars as string | undefined,
      code: bp.Code as string | undefined,
      reference: bp.Reference as string | undefined,
      date: bp.Date as string | undefined,
      type: bp.Type as 'PAYBATCH' | 'RECBATCH' | undefined,
      status: bp.Status as 'AUTHORISED' | 'DELETED' | undefined,
      totalAmount: bp.TotalAmount as number | undefined,
      isReconciled: bp.IsReconciled as boolean | undefined,
      updatedDateUtc: bp.UpdatedDateUTC as string | undefined,
    };
  }

  private mapBatchPaymentToXero(payment: Partial<XeroBatchPayment>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (payment.account) result.Account = { AccountID: payment.account.accountId };
    if (payment.date) result.Date = payment.date;
    if (payment.particulars) result.Particulars = payment.particulars;
    if (payment.code) result.Code = payment.code;
    if (payment.reference) result.Reference = payment.reference;
    if (payment.payments) {
      result.Payments = payment.payments.map(p => ({
        Invoice: p.invoice ? { InvoiceID: p.invoice.invoiceId } : undefined,
        Account: p.account ? { AccountID: p.account.accountId } : undefined,
        Date: p.date,
        Amount: p.amount,
        Reference: p.reference,
      }));
    }
    return result;
  }

  // ===========================================================================
  // Tax Rates
  // ===========================================================================

  async listTaxRates(): Promise<XeroTaxRate[]> {
    const data = await this.request<{ TaxRates: Array<Record<string, unknown>> }>('/TaxRates');
    return data.TaxRates.map(this.mapTaxRate);
  }

  async getTaxRate(taxType: string): Promise<XeroTaxRate> {
    const data = await this.request<{ TaxRates: Array<Record<string, unknown>> }>(`/TaxRates?where=TaxType=="${taxType}"`);
    return this.mapTaxRate(data.TaxRates[0]);
  }

  async createTaxRate(taxRate: Partial<XeroTaxRate>): Promise<XeroTaxRate> {
    const data = await this.request<{ TaxRates: Array<Record<string, unknown>> }>('/TaxRates', {
      method: 'POST',
      body: JSON.stringify({ TaxRates: [this.mapTaxRateToXero(taxRate)] }),
    });
    return this.mapTaxRate(data.TaxRates[0]);
  }

  async updateTaxRate(taxRate: Partial<XeroTaxRate>): Promise<XeroTaxRate> {
    const data = await this.request<{ TaxRates: Array<Record<string, unknown>> }>('/TaxRates', {
      method: 'POST',
      body: JSON.stringify({ TaxRates: [this.mapTaxRateToXero(taxRate)] }),
    });
    return this.mapTaxRate(data.TaxRates[0]);
  }

  private mapTaxRate(tr: Record<string, unknown>): XeroTaxRate {
    return {
      name: tr.Name as string,
      taxType: tr.TaxType as string | undefined,
      taxComponents: (tr.TaxComponents as Array<Record<string, unknown>> | undefined)?.map(tc => ({
        name: tc.Name as string | undefined,
        rate: tc.Rate as number | undefined,
        isCompound: tc.IsCompound as boolean | undefined,
        isNonRecoverable: tc.IsNonRecoverable as boolean | undefined,
      })),
      status: tr.Status as 'ACTIVE' | 'DELETED' | 'ARCHIVED' | undefined,
      reportTaxType: tr.ReportTaxType as XeroTaxRate['reportTaxType'],
      canApplyToAssets: tr.CanApplyToAssets as boolean | undefined,
      canApplyToEquity: tr.CanApplyToEquity as boolean | undefined,
      canApplyToExpenses: tr.CanApplyToExpenses as boolean | undefined,
      canApplyToLiabilities: tr.CanApplyToLiabilities as boolean | undefined,
      canApplyToRevenue: tr.CanApplyToRevenue as boolean | undefined,
      displayTaxRate: tr.DisplayTaxRate as number | undefined,
      effectiveRate: tr.EffectiveRate as number | undefined,
    };
  }

  private mapTaxRateToXero(taxRate: Partial<XeroTaxRate>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (taxRate.name) result.Name = taxRate.name;
    if (taxRate.taxType) result.TaxType = taxRate.taxType;
    if (taxRate.status) result.Status = taxRate.status;
    if (taxRate.reportTaxType) result.ReportTaxType = taxRate.reportTaxType;
    if (taxRate.taxComponents) {
      result.TaxComponents = taxRate.taxComponents.map(tc => ({
        Name: tc.name,
        Rate: tc.rate,
        IsCompound: tc.isCompound,
        IsNonRecoverable: tc.isNonRecoverable,
      }));
    }
    return result;
  }

  // ===========================================================================
  // Currencies
  // ===========================================================================

  async listCurrencies(): Promise<XeroCurrency[]> {
    const data = await this.request<{ Currencies: Array<Record<string, unknown>> }>('/Currencies');
    return data.Currencies.map(c => ({
      code: c.Code as string,
      description: c.Description as string | undefined,
    }));
  }

  async createCurrency(code: string, description?: string): Promise<XeroCurrency> {
    const data = await this.request<{ Currencies: Array<Record<string, unknown>> }>('/Currencies', {
      method: 'PUT',
      body: JSON.stringify({ Code: code, Description: description }),
    });
    const c = data.Currencies[0];
    return { code: c.Code as string, description: c.Description as string | undefined };
  }

  // ===========================================================================
  // Tracking Categories
  // ===========================================================================

  async listTrackingCategories(): Promise<XeroTrackingCategory[]> {
    const data = await this.request<{ TrackingCategories: Array<Record<string, unknown>> }>('/TrackingCategories');
    return data.TrackingCategories.map(this.mapTrackingCategory);
  }

  async getTrackingCategory(trackingCategoryId: string): Promise<XeroTrackingCategory> {
    const data = await this.request<{ TrackingCategories: Array<Record<string, unknown>> }>(`/TrackingCategories/${trackingCategoryId}`);
    return this.mapTrackingCategory(data.TrackingCategories[0]);
  }

  async createTrackingCategory(name: string): Promise<XeroTrackingCategory> {
    const data = await this.request<{ TrackingCategories: Array<Record<string, unknown>> }>('/TrackingCategories', {
      method: 'PUT',
      body: JSON.stringify({ Name: name }),
    });
    return this.mapTrackingCategory(data.TrackingCategories[0]);
  }

  async updateTrackingCategory(trackingCategoryId: string, name: string): Promise<XeroTrackingCategory> {
    const data = await this.request<{ TrackingCategories: Array<Record<string, unknown>> }>(`/TrackingCategories/${trackingCategoryId}`, {
      method: 'POST',
      body: JSON.stringify({ Name: name }),
    });
    return this.mapTrackingCategory(data.TrackingCategories[0]);
  }

  async deleteTrackingCategory(trackingCategoryId: string): Promise<void> {
    await this.request(`/TrackingCategories/${trackingCategoryId}`, { method: 'DELETE' });
  }

  async createTrackingOption(trackingCategoryId: string, name: string): Promise<XeroTrackingCategory> {
    const data = await this.request<{ TrackingCategories: Array<Record<string, unknown>> }>(`/TrackingCategories/${trackingCategoryId}/Options`, {
      method: 'PUT',
      body: JSON.stringify({ Name: name }),
    });
    return this.mapTrackingCategory(data.TrackingCategories[0]);
  }

  async updateTrackingOption(trackingCategoryId: string, trackingOptionId: string, name: string): Promise<XeroTrackingCategory> {
    const data = await this.request<{ TrackingCategories: Array<Record<string, unknown>> }>(`/TrackingCategories/${trackingCategoryId}/Options/${trackingOptionId}`, {
      method: 'POST',
      body: JSON.stringify({ Name: name }),
    });
    return this.mapTrackingCategory(data.TrackingCategories[0]);
  }

  async deleteTrackingOption(trackingCategoryId: string, trackingOptionId: string): Promise<void> {
    await this.request(`/TrackingCategories/${trackingCategoryId}/Options/${trackingOptionId}`, { method: 'DELETE' });
  }

  private mapTrackingCategory(tc: Record<string, unknown>): XeroTrackingCategory {
    return {
      trackingCategoryId: tc.TrackingCategoryID as string,
      name: tc.Name as string | undefined,
      status: tc.Status as 'ACTIVE' | 'ARCHIVED' | 'DELETED' | undefined,
      options: (tc.Options as Array<Record<string, unknown>> | undefined)?.map(o => ({
        trackingOptionId: o.TrackingOptionID as string,
        name: o.Name as string,
        status: o.Status as 'ACTIVE' | 'ARCHIVED' | 'DELETED' | undefined,
      })),
    };
  }

  // ===========================================================================
  // Branding Themes
  // ===========================================================================

  async listBrandingThemes(): Promise<XeroBrandingTheme[]> {
    const data = await this.request<{ BrandingThemes: Array<Record<string, unknown>> }>('/BrandingThemes');
    return data.BrandingThemes.map(this.mapBrandingTheme);
  }

  async getBrandingTheme(brandingThemeId: string): Promise<XeroBrandingTheme> {
    const data = await this.request<{ BrandingThemes: Array<Record<string, unknown>> }>(`/BrandingThemes/${brandingThemeId}`);
    return this.mapBrandingTheme(data.BrandingThemes[0]);
  }

  private mapBrandingTheme(bt: Record<string, unknown>): XeroBrandingTheme {
    return {
      brandingThemeId: bt.BrandingThemeID as string,
      name: bt.Name as string,
      logoUrl: bt.LogoUrl as string | undefined,
      type: bt.Type as XeroBrandingTheme['type'],
      sortOrder: bt.SortOrder as number | undefined,
      createdDateUtc: bt.CreatedDateUTC as string | undefined,
    };
  }

  // ===========================================================================
  // Repeating Invoices
  // ===========================================================================

  async listRepeatingInvoices(): Promise<XeroRepeatingInvoice[]> {
    const data = await this.request<{ RepeatingInvoices: Array<Record<string, unknown>> }>('/RepeatingInvoices');
    return data.RepeatingInvoices.map(this.mapRepeatingInvoice.bind(this));
  }

  async getRepeatingInvoice(repeatingInvoiceId: string): Promise<XeroRepeatingInvoice> {
    const data = await this.request<{ RepeatingInvoices: Array<Record<string, unknown>> }>(`/RepeatingInvoices/${repeatingInvoiceId}`);
    return this.mapRepeatingInvoice(data.RepeatingInvoices[0]);
  }

  async createRepeatingInvoice(invoice: Partial<XeroRepeatingInvoice>): Promise<XeroRepeatingInvoice> {
    const data = await this.request<{ RepeatingInvoices: Array<Record<string, unknown>> }>('/RepeatingInvoices', {
      method: 'POST',
      body: JSON.stringify({ RepeatingInvoices: [this.mapRepeatingInvoiceToXero(invoice)] }),
    });
    return this.mapRepeatingInvoice(data.RepeatingInvoices[0]);
  }

  async updateRepeatingInvoice(repeatingInvoiceId: string, invoice: Partial<XeroRepeatingInvoice>): Promise<XeroRepeatingInvoice> {
    const data = await this.request<{ RepeatingInvoices: Array<Record<string, unknown>> }>(`/RepeatingInvoices/${repeatingInvoiceId}`, {
      method: 'POST',
      body: JSON.stringify({ RepeatingInvoices: [this.mapRepeatingInvoiceToXero(invoice)] }),
    });
    return this.mapRepeatingInvoice(data.RepeatingInvoices[0]);
  }

  async deleteRepeatingInvoice(repeatingInvoiceId: string): Promise<void> {
    await this.request(`/RepeatingInvoices/${repeatingInvoiceId}`, {
      method: 'POST',
      body: JSON.stringify({ RepeatingInvoices: [{ Status: 'DELETED' }] }),
    });
  }

  private mapRepeatingInvoice(ri: Record<string, unknown>): XeroRepeatingInvoice {
    const contact = ri.Contact as Record<string, unknown> | undefined;
    const schedule = ri.Schedule as Record<string, unknown> | undefined;
    return {
      repeatingInvoiceId: ri.RepeatingInvoiceID as string,
      type: ri.Type as 'ACCREC' | 'ACCPAY',
      reference: ri.Reference as string | undefined,
      hasAttachments: ri.HasAttachments as boolean | undefined,
      contact: {
        contactId: contact?.ContactID as string,
        name: contact?.Name as string | undefined,
      },
      schedule: schedule ? {
        period: schedule.Period as number | undefined,
        unit: schedule.Unit as 'WEEKLY' | 'MONTHLY' | 'YEARLY' | undefined,
        dueDate: schedule.DueDate as number | undefined,
        dueDateType: schedule.DueDateType as XeroRepeatingInvoice['schedule'] extends { dueDateType?: infer T } ? T : never,
        startDate: schedule.StartDate as string | undefined,
        nextScheduledDate: schedule.NextScheduledDate as string | undefined,
        endDate: schedule.EndDate as string | undefined,
      } : undefined,
      lineItems: (ri.LineItems as Array<Record<string, unknown>> | undefined)?.map(this.mapLineItem),
      lineAmountTypes: ri.LineAmountTypes as 'Exclusive' | 'Inclusive' | 'NoTax' | undefined,
      status: ri.Status as 'DRAFT' | 'AUTHORISED' | 'DELETED' | undefined,
      subTotal: ri.SubTotal as number | undefined,
      totalTax: ri.TotalTax as number | undefined,
      total: ri.Total as number | undefined,
      currencyCode: ri.CurrencyCode as string | undefined,
      brandingThemeId: ri.BrandingThemeID as string | undefined,
      approvedForSending: ri.ApprovedForSending as boolean | undefined,
      sendCopy: ri.SendCopy as boolean | undefined,
      markAsSent: ri.MarkAsSent as boolean | undefined,
      includePdf: ri.IncludePDF as boolean | undefined,
    };
  }

  private mapRepeatingInvoiceToXero(invoice: Partial<XeroRepeatingInvoice>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (invoice.type) result.Type = invoice.type;
    if (invoice.contact) result.Contact = { ContactID: invoice.contact.contactId };
    if (invoice.reference) result.Reference = invoice.reference;
    if (invoice.status) result.Status = invoice.status;
    if (invoice.lineAmountTypes) result.LineAmountTypes = invoice.lineAmountTypes;
    if (invoice.currencyCode) result.CurrencyCode = invoice.currencyCode;
    if (invoice.brandingThemeId) result.BrandingThemeID = invoice.brandingThemeId;
    if (invoice.approvedForSending !== undefined) result.ApprovedForSending = invoice.approvedForSending;
    if (invoice.sendCopy !== undefined) result.SendCopy = invoice.sendCopy;
    if (invoice.markAsSent !== undefined) result.MarkAsSent = invoice.markAsSent;
    if (invoice.includePdf !== undefined) result.IncludePDF = invoice.includePdf;
    if (invoice.schedule) {
      result.Schedule = {
        Period: invoice.schedule.period,
        Unit: invoice.schedule.unit,
        DueDate: invoice.schedule.dueDate,
        DueDateType: invoice.schedule.dueDateType,
        StartDate: invoice.schedule.startDate,
        EndDate: invoice.schedule.endDate,
      };
    }
    if (invoice.lineItems) {
      result.LineItems = invoice.lineItems.map(li => ({
        Description: li.description,
        Quantity: li.quantity,
        UnitAmount: li.unitAmount,
        ItemCode: li.itemCode,
        AccountCode: li.accountCode,
        TaxType: li.taxType,
      }));
    }
    return result;
  }

  // ===========================================================================
  // Users
  // ===========================================================================

  async listUsers(): Promise<XeroUser[]> {
    const data = await this.request<{ Users: Array<Record<string, unknown>> }>('/Users');
    return data.Users.map(this.mapUser);
  }

  async getUser(userId: string): Promise<XeroUser> {
    const data = await this.request<{ Users: Array<Record<string, unknown>> }>(`/Users/${userId}`);
    return this.mapUser(data.Users[0]);
  }

  private mapUser(u: Record<string, unknown>): XeroUser {
    return {
      userId: u.UserID as string,
      emailAddress: u.EmailAddress as string,
      firstName: u.FirstName as string | undefined,
      lastName: u.LastName as string | undefined,
      updatedDateUtc: u.UpdatedDateUTC as string | undefined,
      isSubscriber: u.IsSubscriber as boolean | undefined,
      organisationRole: u.OrganisationRole as XeroUser['organisationRole'],
    };
  }

  // ===========================================================================
  // Linked Transactions
  // ===========================================================================

  async listLinkedTransactions(params?: PaginationParams & { sourceTransactionId?: string; contactId?: string }): Promise<PaginatedResponse<XeroLinkedTransaction>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.where) queryParams.set('where', params.where);
    if (params?.sourceTransactionId) queryParams.set('SourceTransactionID', params.sourceTransactionId);
    if (params?.contactId) queryParams.set('ContactID', params.contactId);

    const queryString = queryParams.toString();
    const data = await this.request<{ LinkedTransactions: Array<Record<string, unknown>> }>(`/LinkedTransactions${queryString ? `?${queryString}` : ''}`);

    const transactions = data.LinkedTransactions.map(this.mapLinkedTransaction);
    return {
      items: transactions,
      count: transactions.length,
      hasMore: transactions.length >= 100,
      page: params?.page || 1,
    };
  }

  async getLinkedTransaction(linkedTransactionId: string): Promise<XeroLinkedTransaction> {
    const data = await this.request<{ LinkedTransactions: Array<Record<string, unknown>> }>(`/LinkedTransactions/${linkedTransactionId}`);
    return this.mapLinkedTransaction(data.LinkedTransactions[0]);
  }

  async createLinkedTransaction(transaction: Partial<XeroLinkedTransaction>): Promise<XeroLinkedTransaction> {
    const data = await this.request<{ LinkedTransactions: Array<Record<string, unknown>> }>('/LinkedTransactions', {
      method: 'POST',
      body: JSON.stringify({
        SourceTransactionID: transaction.sourceTransactionId,
        SourceLineItemID: transaction.sourceLineItemId,
        ContactID: transaction.contactId,
      }),
    });
    return this.mapLinkedTransaction(data.LinkedTransactions[0]);
  }

  async updateLinkedTransaction(linkedTransactionId: string, transaction: Partial<XeroLinkedTransaction>): Promise<XeroLinkedTransaction> {
    const data = await this.request<{ LinkedTransactions: Array<Record<string, unknown>> }>(`/LinkedTransactions/${linkedTransactionId}`, {
      method: 'POST',
      body: JSON.stringify({
        SourceTransactionID: transaction.sourceTransactionId,
        SourceLineItemID: transaction.sourceLineItemId,
        ContactID: transaction.contactId,
        TargetTransactionID: transaction.targetTransactionId,
        TargetLineItemID: transaction.targetLineItemId,
      }),
    });
    return this.mapLinkedTransaction(data.LinkedTransactions[0]);
  }

  async deleteLinkedTransaction(linkedTransactionId: string): Promise<void> {
    await this.request(`/LinkedTransactions/${linkedTransactionId}`, { method: 'DELETE' });
  }

  private mapLinkedTransaction(lt: Record<string, unknown>): XeroLinkedTransaction {
    return {
      linkedTransactionId: lt.LinkedTransactionID as string,
      sourceTransactionId: lt.SourceTransactionID as string | undefined,
      sourceLineItemId: lt.SourceLineItemID as string | undefined,
      sourceTransactionTypeCode: lt.SourceTransactionTypeCode as 'ACCPAY' | 'SPEND' | undefined,
      contactId: lt.ContactID as string | undefined,
      targetTransactionId: lt.TargetTransactionID as string | undefined,
      targetLineItemId: lt.TargetLineItemID as string | undefined,
      status: lt.Status as XeroLinkedTransaction['status'],
      type: lt.Type as 'BILLABLEEXPENSE' | undefined,
      updatedDateUtc: lt.UpdatedDateUTC as string | undefined,
    };
  }

  // ===========================================================================
  // Reports
  // ===========================================================================

  async getReport(reportName: string, params?: Record<string, string>): Promise<XeroReport> {
    const queryParams = new URLSearchParams(params || {});
    const queryString = queryParams.toString();
    const data = await this.request<{ Reports: Array<Record<string, unknown>> }>(`/Reports/${reportName}${queryString ? `?${queryString}` : ''}`);
    return this.mapReport(data.Reports[0]);
  }

  async getBalanceSheet(params?: { date?: string; periods?: number; timeframe?: string; trackingOptionId1?: string; trackingOptionId2?: string; standardLayout?: boolean; paymentsOnly?: boolean }): Promise<XeroReport> {
    const queryParams: Record<string, string> = {};
    if (params?.date) queryParams.date = params.date;
    if (params?.periods) queryParams.periods = String(params.periods);
    if (params?.timeframe) queryParams.timeframe = params.timeframe;
    if (params?.trackingOptionId1) queryParams.trackingOptionID1 = params.trackingOptionId1;
    if (params?.trackingOptionId2) queryParams.trackingOptionID2 = params.trackingOptionId2;
    if (params?.standardLayout !== undefined) queryParams.standardLayout = String(params.standardLayout);
    if (params?.paymentsOnly !== undefined) queryParams.paymentsOnly = String(params.paymentsOnly);
    return this.getReport('BalanceSheet', queryParams);
  }

  async getProfitAndLoss(params?: { fromDate?: string; toDate?: string; periods?: number; timeframe?: string; trackingCategoryId?: string; trackingOptionId?: string; trackingCategoryId2?: string; trackingOptionId2?: string; standardLayout?: boolean; paymentsOnly?: boolean }): Promise<XeroReport> {
    const queryParams: Record<string, string> = {};
    if (params?.fromDate) queryParams.fromDate = params.fromDate;
    if (params?.toDate) queryParams.toDate = params.toDate;
    if (params?.periods) queryParams.periods = String(params.periods);
    if (params?.timeframe) queryParams.timeframe = params.timeframe;
    if (params?.trackingCategoryId) queryParams.trackingCategoryID = params.trackingCategoryId;
    if (params?.trackingOptionId) queryParams.trackingOptionID = params.trackingOptionId;
    if (params?.trackingCategoryId2) queryParams.trackingCategoryID2 = params.trackingCategoryId2;
    if (params?.trackingOptionId2) queryParams.trackingOptionID2 = params.trackingOptionId2;
    if (params?.standardLayout !== undefined) queryParams.standardLayout = String(params.standardLayout);
    if (params?.paymentsOnly !== undefined) queryParams.paymentsOnly = String(params.paymentsOnly);
    return this.getReport('ProfitAndLoss', queryParams);
  }

  async getTrialBalance(params?: { date?: string; paymentsOnly?: boolean }): Promise<XeroReport> {
    const queryParams: Record<string, string> = {};
    if (params?.date) queryParams.date = params.date;
    if (params?.paymentsOnly !== undefined) queryParams.paymentsOnly = String(params.paymentsOnly);
    return this.getReport('TrialBalance', queryParams);
  }

  async getBankSummary(params?: { fromDate?: string; toDate?: string }): Promise<XeroReport> {
    const queryParams: Record<string, string> = {};
    if (params?.fromDate) queryParams.fromDate = params.fromDate;
    if (params?.toDate) queryParams.toDate = params.toDate;
    return this.getReport('BankSummary', queryParams);
  }

  async getAgedReceivablesByContact(params: { contactId: string; date?: string; fromDate?: string; toDate?: string }): Promise<XeroReport> {
    const queryParams: Record<string, string> = { contactID: params.contactId };
    if (params.date) queryParams.date = params.date;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;
    return this.getReport('AgedReceivablesByContact', queryParams);
  }

  async getAgedPayablesByContact(params: { contactId: string; date?: string; fromDate?: string; toDate?: string }): Promise<XeroReport> {
    const queryParams: Record<string, string> = { contactID: params.contactId };
    if (params.date) queryParams.date = params.date;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;
    return this.getReport('AgedPayablesByContact', queryParams);
  }

  async getBudgetSummary(params?: { date?: string; periods?: number; timeframe?: number }): Promise<XeroReport> {
    const queryParams: Record<string, string> = {};
    if (params?.date) queryParams.date = params.date;
    if (params?.periods) queryParams.periods = String(params.periods);
    if (params?.timeframe) queryParams.timeframe = String(params.timeframe);
    return this.getReport('BudgetSummary', queryParams);
  }

  async getExecutiveSummary(params?: { date?: string }): Promise<XeroReport> {
    const queryParams: Record<string, string> = {};
    if (params?.date) queryParams.date = params.date;
    return this.getReport('ExecutiveSummary', queryParams);
  }

  private mapReport(r: Record<string, unknown>): XeroReport {
    return {
      reportId: r.ReportID as string | undefined,
      reportName: r.ReportName as string | undefined,
      reportType: r.ReportType as string | undefined,
      reportTitles: r.ReportTitles as string[] | undefined,
      reportDate: r.ReportDate as string | undefined,
      updatedDateUtc: r.UpdatedDateUTC as string | undefined,
      rows: r.Rows as XeroReport['rows'],
    };
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a Xero client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createXeroClient(credentials: TenantCredentials): XeroClient {
  return new XeroClientImpl(credentials);
}
