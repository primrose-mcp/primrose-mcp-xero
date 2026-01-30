/**
 * Linked Transaction Tools
 *
 * MCP tools for Xero linked transactions (linking billable expenses to invoices).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { XeroClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerLinkedTransactionTools(server: McpServer, client: XeroClient): void {
  server.tool(
    'xero_list_linked_transactions',
    `List linked transactions from Xero. Linked transactions link billable expenses to sales invoices.

Args:
  - page: Page number
  - sourceTransactionId: Filter by source transaction ID
  - contactId: Filter by contact ID`,
    {
      page: z.number().int().min(1).default(1).describe('Page number'),
      sourceTransactionId: z.string().optional().describe('Source transaction ID'),
      contactId: z.string().optional().describe('Contact ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ page, sourceTransactionId, contactId, format }) => {
      try {
        const result = await client.listLinkedTransactions({
          page,
          sourceTransactionId,
          contactId,
        });
        return formatResponse(result, format, 'linkedTransactions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_linked_transaction',
    `Get details for a specific linked transaction.

Args:
  - linkedTransactionId: Linked transaction ID`,
    {
      linkedTransactionId: z.string().describe('Linked transaction ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ linkedTransactionId, format }) => {
      try {
        const linkedTransaction = await client.getLinkedTransaction(linkedTransactionId);
        return formatResponse(linkedTransaction, format, 'linkedTransaction');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_linked_transaction',
    `Create a linked transaction to link a billable expense to a sales invoice.

Args:
  - sourceTransactionId: Source transaction ID (bill or expense claim)
  - sourceLineItemId: Source line item ID
  - contactId: Contact ID to invoice
  - targetTransactionId: Target invoice ID (optional, can link later)
  - targetLineItemId: Target line item ID (optional)`,
    {
      sourceTransactionId: z.string().describe('Source transaction ID'),
      sourceLineItemId: z.string().describe('Source line item ID'),
      contactId: z.string().describe('Contact ID'),
      targetTransactionId: z.string().optional().describe('Target transaction ID'),
      targetLineItemId: z.string().optional().describe('Target line item ID'),
    },
    async ({ sourceTransactionId, sourceLineItemId, contactId, targetTransactionId, targetLineItemId }) => {
      try {
        const linkedTransaction = await client.createLinkedTransaction({
          sourceTransactionId,
          sourceLineItemId,
          contactId,
          targetTransactionId,
          targetLineItemId,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Linked transaction created', linkedTransaction }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_linked_transaction',
    `Update a linked transaction.

Args:
  - linkedTransactionId: Linked transaction ID to update
  - sourceLineItemId: Source line item ID
  - contactId: Contact ID
  - targetTransactionId: Target transaction ID
  - targetLineItemId: Target line item ID`,
    {
      linkedTransactionId: z.string().describe('Linked transaction ID'),
      sourceLineItemId: z.string().optional().describe('Source line item ID'),
      contactId: z.string().optional().describe('Contact ID'),
      targetTransactionId: z.string().optional().describe('Target transaction ID'),
      targetLineItemId: z.string().optional().describe('Target line item ID'),
    },
    async ({ linkedTransactionId, ...input }) => {
      try {
        const linkedTransaction = await client.updateLinkedTransaction(linkedTransactionId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Linked transaction updated', linkedTransaction }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_delete_linked_transaction',
    `Delete a linked transaction.

Args:
  - linkedTransactionId: Linked transaction ID to delete`,
    {
      linkedTransactionId: z.string().describe('Linked transaction ID to delete'),
    },
    async ({ linkedTransactionId }) => {
      try {
        await client.deleteLinkedTransaction(linkedTransactionId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Linked transaction ${linkedTransactionId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
