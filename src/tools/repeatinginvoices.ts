/**
 * Repeating Invoice Tools
 *
 * MCP tools for Xero repeating invoice management.
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
});

const scheduleSchema = z.object({
  period: z.number().int().describe('Period between repeating invoices'),
  unit: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).describe('Unit of period'),
  dueDate: z.number().int().optional().describe('Due date day of month'),
  dueDateType: z.enum(['DAYSAFTERBILLDATE', 'DAYSAFTERBILLMONTH', 'OFCURRENTMONTH', 'OFFOLLOWINGMONTH']).optional().describe('Due date type'),
  startDate: z.string().optional().describe('Start date'),
  endDate: z.string().optional().describe('End date'),
  nextScheduledDate: z.string().optional().describe('Next scheduled date'),
});

export function registerRepeatingInvoiceTools(server: McpServer, client: XeroClient): void {
  server.tool(
    'xero_list_repeating_invoices',
    `List repeating invoices from Xero.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const invoices = await client.listRepeatingInvoices();
        return formatResponse({ items: invoices, count: invoices.length }, format, 'repeatingInvoices');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_repeating_invoice',
    `Get details for a specific repeating invoice.

Args:
  - repeatingInvoiceId: Repeating invoice ID`,
    {
      repeatingInvoiceId: z.string().describe('Repeating invoice ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ repeatingInvoiceId, format }) => {
      try {
        const invoice = await client.getRepeatingInvoice(repeatingInvoiceId);
        return formatResponse(invoice, format, 'repeatingInvoice');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_repeating_invoice',
    `Create a new repeating invoice.

Args:
  - type: Invoice type (ACCPAY for bills, ACCREC for invoices)
  - contactId: Contact ID
  - lineItems: Array of line items
  - schedule: Schedule configuration with period, unit, dueDate, etc.
  - reference: Reference
  - brandingThemeId: Branding theme ID
  - currencyCode: Currency code
  - status: Status (DRAFT, AUTHORISED)`,
    {
      type: z.enum(['ACCPAY', 'ACCREC']).describe('Invoice type'),
      contactId: z.string().describe('Contact ID'),
      lineItems: z.array(lineItemSchema).describe('Line items'),
      schedule: scheduleSchema.describe('Schedule configuration'),
      reference: z.string().optional().describe('Reference'),
      brandingThemeId: z.string().optional().describe('Branding theme ID'),
      currencyCode: z.string().optional().describe('Currency code'),
      status: z.enum(['DRAFT', 'AUTHORISED']).optional().describe('Status'),
    },
    async ({ type, contactId, lineItems, schedule, reference, brandingThemeId, currencyCode, status }) => {
      try {
        const invoice = await client.createRepeatingInvoice({
          type,
          contact: { contactId },
          lineItems: lineItems as XeroLineItem[],
          schedule: {
            period: schedule.period,
            unit: schedule.unit,
            dueDate: schedule.dueDate,
            dueDateType: schedule.dueDateType,
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            nextScheduledDate: schedule.nextScheduledDate,
          },
          reference,
          brandingThemeId,
          currencyCode,
          status,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Repeating invoice created', invoice }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_repeating_invoice',
    `Update an existing repeating invoice.

Args:
  - repeatingInvoiceId: Repeating invoice ID to update
  - reference: Reference
  - status: Status (DRAFT, AUTHORISED, DELETED)`,
    {
      repeatingInvoiceId: z.string().describe('Repeating invoice ID'),
      reference: z.string().optional().describe('Reference'),
      status: z.enum(['DRAFT', 'AUTHORISED', 'DELETED']).optional().describe('Status'),
    },
    async ({ repeatingInvoiceId, ...input }) => {
      try {
        const invoice = await client.updateRepeatingInvoice(repeatingInvoiceId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Repeating invoice updated', invoice }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_delete_repeating_invoice',
    `Delete a repeating invoice.

Args:
  - repeatingInvoiceId: Repeating invoice ID to delete`,
    {
      repeatingInvoiceId: z.string().describe('Repeating invoice ID to delete'),
    },
    async ({ repeatingInvoiceId }) => {
      try {
        await client.deleteRepeatingInvoice(repeatingInvoiceId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Repeating invoice ${repeatingInvoiceId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
