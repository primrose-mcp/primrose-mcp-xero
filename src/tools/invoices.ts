/**
 * Invoice Tools
 *
 * MCP tools for Xero invoice management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { XeroClient } from '../client.js';
import type { XeroLineItem } from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const lineItemSchema = z.object({
  description: z.string().describe('Line item description'),
  quantity: z.number().describe('Quantity'),
  unitAmount: z.number().describe('Unit amount'),
  accountCode: z.string().describe('Account code'),
  itemCode: z.string().optional().describe('Item code'),
  taxType: z.string().optional().describe('Tax type'),
  discountRate: z.number().optional().describe('Discount rate (percentage)'),
});

export function registerInvoiceTools(server: McpServer, client: XeroClient): void {
  server.tool(
    'xero_list_invoices',
    `List invoices from Xero.

Args:
  - page: Page number (1-based)
  - where: Filter expression (e.g., 'Status=="AUTHORISED"')
  - order: Sort order (e.g., 'Date DESC')
  - statuses: Filter by status (DRAFT, SUBMITTED, AUTHORISED, PAID, VOIDED)`,
    {
      page: z.number().int().min(1).default(1).describe('Page number'),
      where: z.string().optional().describe('Filter expression'),
      order: z.string().optional().describe('Sort order'),
      statuses: z.array(z.string()).optional().describe('Filter by statuses'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ page, where, order, statuses, format }) => {
      try {
        const result = await client.listInvoices({ page, where, order, statuses });
        return formatResponse(result, format, 'invoices');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_invoice',
    `Get details for a specific invoice.

Args:
  - invoiceId: The invoice ID`,
    {
      invoiceId: z.string().describe('Invoice ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ invoiceId, format }) => {
      try {
        const invoice = await client.getInvoice(invoiceId);
        return formatResponse(invoice, format, 'invoice');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_invoice',
    `Create a new invoice in Xero.

Args:
  - type: ACCREC (sales invoice) or ACCPAY (bill)
  - contactId: Contact ID
  - lineItems: Array of line items
  - date: Invoice date (YYYY-MM-DD)
  - dueDate: Due date (YYYY-MM-DD)
  - reference: Invoice reference
  - status: Status (DRAFT, SUBMITTED, AUTHORISED)
  - lineAmountTypes: Exclusive, Inclusive, or NoTax`,
    {
      type: z.enum(['ACCREC', 'ACCPAY']).describe('Invoice type'),
      contactId: z.string().describe('Contact ID'),
      lineItems: z.array(lineItemSchema).describe('Line items'),
      date: z.string().optional().describe('Invoice date'),
      dueDate: z.string().optional().describe('Due date'),
      reference: z.string().optional().describe('Reference'),
      status: z.enum(['DRAFT', 'SUBMITTED', 'AUTHORISED']).optional().describe('Status'),
      lineAmountTypes: z.enum(['Exclusive', 'Inclusive', 'NoTax']).optional().describe('Line amount types'),
      currencyCode: z.string().optional().describe('Currency code'),
      brandingThemeId: z.string().optional().describe('Branding theme ID'),
    },
    async ({ type, contactId, lineItems, date, dueDate, reference, status, lineAmountTypes, currencyCode, brandingThemeId }) => {
      try {
        const invoice = await client.createInvoice({
          type,
          contact: { contactId },
          lineItems: lineItems as XeroLineItem[],
          date,
          dueDate,
          reference,
          status,
          lineAmountTypes,
          currencyCode,
          brandingThemeId,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Invoice created', invoice }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_invoice',
    `Update an existing invoice.

Args:
  - invoiceId: Invoice ID to update
  - reference: Invoice reference
  - date: Invoice date
  - dueDate: Due date
  - status: Status (DRAFT, SUBMITTED, AUTHORISED)`,
    {
      invoiceId: z.string().describe('Invoice ID to update'),
      reference: z.string().optional().describe('Reference'),
      date: z.string().optional().describe('Invoice date'),
      dueDate: z.string().optional().describe('Due date'),
      status: z.enum(['DRAFT', 'SUBMITTED', 'AUTHORISED']).optional().describe('Status'),
    },
    async ({ invoiceId, ...input }) => {
      try {
        const invoice = await client.updateInvoice(invoiceId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Invoice updated', invoice }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_void_invoice',
    `Void an invoice.

Args:
  - invoiceId: Invoice ID to void`,
    {
      invoiceId: z.string().describe('Invoice ID to void'),
    },
    async ({ invoiceId }) => {
      try {
        const invoice = await client.voidInvoice(invoiceId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Invoice voided', invoice }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_delete_invoice',
    `Delete a draft invoice.

Args:
  - invoiceId: Invoice ID to delete`,
    {
      invoiceId: z.string().describe('Invoice ID to delete'),
    },
    async ({ invoiceId }) => {
      try {
        await client.deleteInvoice(invoiceId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Invoice ${invoiceId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
