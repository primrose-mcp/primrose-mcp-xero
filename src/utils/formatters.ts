/**
 * Response Formatting Utilities
 *
 * Helpers for formatting tool responses in JSON or Markdown.
 */

import type {
  PaginatedResponse,
  ResponseFormat,
  XeroContact,
  XeroInvoice,
  XeroAccount,
  XeroPayment,
} from '../types/entities.js';
import { CrmApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 * Note: Index signature required for MCP SDK 1.25+ compatibility
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof CrmApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).items)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');

  lines.push(`**Showing:** ${data.count}`);

  if (data.hasMore) {
    lines.push(`**More available:** Yes (page: ${(data.page || 1) + 1})`);
  }
  lines.push('');

  if (data.items.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  // Format items based on entity type
  switch (entityType) {
    case 'contacts':
      lines.push(formatContactsTable(data.items as XeroContact[]));
      break;
    case 'invoices':
      lines.push(formatInvoicesTable(data.items as XeroInvoice[]));
      break;
    case 'accounts':
      lines.push(formatAccountsTable(data.items as XeroAccount[]));
      break;
    case 'payments':
      lines.push(formatPaymentsTable(data.items as XeroPayment[]));
      break;
    default:
      lines.push(formatGenericTable(data.items));
  }

  return lines.join('\n');
}

/**
 * Format Xero contacts as Markdown table
 */
function formatContactsTable(contacts: XeroContact[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Email | Phone | Status |');
  lines.push('|---|---|---|---|---|');

  for (const contact of contacts) {
    const name = contact.name || '-';
    const email = contact.emailAddress || '-';
    const phone = contact.phones?.find(p => p.phoneNumber)?.phoneNumber || '-';
    lines.push(
      `| ${contact.contactId} | ${name} | ${email} | ${phone} | ${contact.contactStatus || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format Xero invoices as Markdown table
 */
function formatInvoicesTable(invoices: XeroInvoice[]): string {
  const lines: string[] = [];
  lines.push('| Invoice # | Contact | Total | Status | Due Date |');
  lines.push('|---|---|---|---|---|');

  for (const invoice of invoices) {
    const contactName = invoice.contact?.name || '-';
    const total = invoice.total?.toLocaleString() || '-';
    lines.push(
      `| ${invoice.invoiceNumber || invoice.invoiceId} | ${contactName} | ${total} | ${invoice.status || '-'} | ${invoice.dueDate || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format Xero accounts as Markdown table
 */
function formatAccountsTable(accounts: XeroAccount[]): string {
  const lines: string[] = [];
  lines.push('| Code | Name | Type | Status |');
  lines.push('|---|---|---|---|');

  for (const account of accounts) {
    lines.push(
      `| ${account.code || '-'} | ${account.name} | ${account.type || '-'} | ${account.status || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format Xero payments as Markdown table
 */
function formatPaymentsTable(payments: XeroPayment[]): string {
  const lines: string[] = [];
  lines.push('| ID | Invoice | Amount | Date | Status |');
  lines.push('|---|---|---|---|---|');

  for (const payment of payments) {
    const invoiceNumber = payment.invoice?.invoiceNumber || '-';
    lines.push(
      `| ${payment.paymentId} | ${invoiceNumber} | ${payment.amount} | ${payment.date || '-'} | ${payment.status || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5); // Limit columns

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => String(record[k] ?? '-'));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  return formatGenericTable(data);
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (camelCase to Title Case)
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
