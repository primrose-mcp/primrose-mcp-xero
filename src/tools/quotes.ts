/**
 * Quote Tools
 *
 * MCP tools for Xero quote management.
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

export function registerQuoteTools(server: McpServer, client: XeroClient): void {
  server.tool(
    'xero_list_quotes',
    `List quotes from Xero.

Args:
  - page: Page number
  - where: Filter expression
  - order: Sort order
  - status: Filter by status (DRAFT, SENT, DECLINED, ACCEPTED, INVOICED, DELETED)`,
    {
      page: z.number().int().min(1).default(1).describe('Page number'),
      where: z.string().optional().describe('Filter expression'),
      order: z.string().optional().describe('Sort order'),
      status: z.string().optional().describe('Status filter'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ page, where, order, status, format }) => {
      try {
        const result = await client.listQuotes({ page, where, order, status });
        return formatResponse(result, format, 'quotes');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_quote',
    `Get details for a specific quote.

Args:
  - quoteId: Quote ID`,
    {
      quoteId: z.string().describe('Quote ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ quoteId, format }) => {
      try {
        const quote = await client.getQuote(quoteId);
        return formatResponse(quote, format, 'quote');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_quote',
    `Create a new quote.

Args:
  - contactId: Contact ID
  - lineItems: Array of line items
  - date: Quote date
  - expiryDate: Expiry date
  - reference: Reference
  - title: Quote title
  - summary: Quote summary
  - terms: Terms and conditions
  - status: Status (DRAFT, SENT)`,
    {
      contactId: z.string().describe('Contact ID'),
      lineItems: z.array(lineItemSchema).describe('Line items'),
      date: z.string().optional().describe('Quote date'),
      expiryDate: z.string().optional().describe('Expiry date'),
      reference: z.string().optional().describe('Reference'),
      title: z.string().optional().describe('Title'),
      summary: z.string().optional().describe('Summary'),
      terms: z.string().optional().describe('Terms and conditions'),
      status: z.enum(['DRAFT', 'SENT']).optional().describe('Status'),
      currencyCode: z.string().optional().describe('Currency code'),
      brandingThemeId: z.string().optional().describe('Branding theme ID'),
    },
    async ({ contactId, lineItems, date, expiryDate, reference, title, summary, terms, status, currencyCode, brandingThemeId }) => {
      try {
        const quote = await client.createQuote({
          contact: { contactId },
          lineItems: lineItems as XeroLineItem[],
          date,
          expiryDate,
          reference,
          title,
          summary,
          terms,
          status,
          currencyCode,
          brandingThemeId,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Quote created', quote }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_quote',
    `Update an existing quote.

Args:
  - quoteId: Quote ID to update
  - reference: Reference
  - date: Quote date
  - expiryDate: Expiry date
  - title: Title
  - summary: Summary
  - terms: Terms and conditions
  - status: Status`,
    {
      quoteId: z.string().describe('Quote ID'),
      reference: z.string().optional().describe('Reference'),
      date: z.string().optional().describe('Quote date'),
      expiryDate: z.string().optional().describe('Expiry date'),
      title: z.string().optional().describe('Title'),
      summary: z.string().optional().describe('Summary'),
      terms: z.string().optional().describe('Terms and conditions'),
      status: z.enum(['DRAFT', 'SENT', 'DECLINED', 'ACCEPTED']).optional().describe('Status'),
    },
    async ({ quoteId, ...input }) => {
      try {
        const quote = await client.updateQuote(quoteId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Quote updated', quote }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_delete_quote',
    `Delete a quote.

Args:
  - quoteId: Quote ID to delete`,
    {
      quoteId: z.string().describe('Quote ID to delete'),
    },
    async ({ quoteId }) => {
      try {
        await client.deleteQuote(quoteId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Quote ${quoteId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
