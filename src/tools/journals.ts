/**
 * Journal Tools
 *
 * MCP tools for Xero journals and manual journals.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { XeroClient } from '../client.js';
import type { XeroManualJournalLine } from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const journalLineSchema = z.object({
  lineAmount: z.number().describe('Line amount (positive for debit, negative for credit)'),
  accountCode: z.string().describe('Account code'),
  description: z.string().optional().describe('Line description'),
  taxType: z.string().optional().describe('Tax type'),
});

export function registerJournalTools(server: McpServer, client: XeroClient): void {
  // Journals (read-only system journals)
  server.tool(
    'xero_list_journals',
    `List system journals from Xero. These are automatically created journals for all transactions.

Args:
  - offset: Offset for pagination (journal number to start from)
  - where: Filter expression
  - order: Sort order`,
    {
      offset: z.number().int().optional().describe('Offset (journal number)'),
      where: z.string().optional().describe('Filter expression'),
      order: z.string().optional().describe('Sort order'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ offset, where, order, format }) => {
      try {
        const journals = await client.listJournals({ offset, where, order });
        return formatResponse({ items: journals, count: journals.length, hasMore: journals.length >= 100 }, format, 'journals');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_journal',
    `Get details for a specific journal.

Args:
  - journalId: Journal ID`,
    {
      journalId: z.string().describe('Journal ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ journalId, format }) => {
      try {
        const journal = await client.getJournal(journalId);
        return formatResponse(journal, format, 'journal');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Manual Journals
  server.tool(
    'xero_list_manual_journals',
    `List manual journals from Xero.

Args:
  - page: Page number
  - where: Filter expression
  - order: Sort order`,
    {
      page: z.number().int().min(1).default(1).describe('Page number'),
      where: z.string().optional().describe('Filter expression'),
      order: z.string().optional().describe('Sort order'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ page, where, order, format }) => {
      try {
        const result = await client.listManualJournals({ page, where, order });
        return formatResponse(result, format, 'manualJournals');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_manual_journal',
    `Get details for a specific manual journal.

Args:
  - manualJournalId: Manual journal ID`,
    {
      manualJournalId: z.string().describe('Manual journal ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ manualJournalId, format }) => {
      try {
        const journal = await client.getManualJournal(manualJournalId);
        return formatResponse(journal, format, 'manualJournal');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_manual_journal',
    `Create a manual journal entry. Journal lines must balance to zero.

Args:
  - narration: Description of the journal entry (required)
  - journalLines: Array of journal lines (must balance to zero)
  - date: Journal date
  - status: Status (DRAFT or POSTED)
  - showOnCashBasisReports: Show on cash basis reports`,
    {
      narration: z.string().describe('Journal description'),
      journalLines: z.array(journalLineSchema).describe('Journal lines (must balance to zero)'),
      date: z.string().optional().describe('Journal date'),
      status: z.enum(['DRAFT', 'POSTED']).optional().describe('Status'),
      showOnCashBasisReports: z.boolean().optional().describe('Show on cash basis reports'),
    },
    async ({ narration, journalLines, date, status, showOnCashBasisReports }) => {
      try {
        const journal = await client.createManualJournal({
          narration,
          journalLines: journalLines as XeroManualJournalLine[],
          date,
          status,
          showOnCashBasisReports,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Manual journal created', journal }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_manual_journal',
    `Update an existing manual journal.

Args:
  - manualJournalId: Manual journal ID to update
  - narration: Description
  - date: Journal date
  - status: Status (DRAFT or POSTED)`,
    {
      manualJournalId: z.string().describe('Manual journal ID'),
      narration: z.string().optional().describe('Journal description'),
      date: z.string().optional().describe('Journal date'),
      status: z.enum(['DRAFT', 'POSTED']).optional().describe('Status'),
    },
    async ({ manualJournalId, ...input }) => {
      try {
        const journal = await client.updateManualJournal(manualJournalId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Manual journal updated', journal }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
