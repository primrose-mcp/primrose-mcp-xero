/**
 * Banking Tools
 *
 * MCP tools for Xero bank transactions and bank transfers.
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
  taxType: z.string().optional().describe('Tax type'),
});

export function registerBankingTools(server: McpServer, client: XeroClient): void {
  // Bank Transactions
  server.tool(
    'xero_list_bank_transactions',
    `List bank transactions (spend/receive money) from Xero.

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
        const result = await client.listBankTransactions({ page, where, order });
        return formatResponse(result, format, 'bankTransactions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_bank_transaction',
    `Get details for a specific bank transaction.

Args:
  - bankTransactionId: Bank transaction ID`,
    {
      bankTransactionId: z.string().describe('Bank transaction ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ bankTransactionId, format }) => {
      try {
        const transaction = await client.getBankTransaction(bankTransactionId);
        return formatResponse(transaction, format, 'bankTransaction');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_bank_transaction',
    `Create a bank transaction (spend or receive money).

Args:
  - type: Transaction type (RECEIVE, SPEND, RECEIVE-OVERPAYMENT, SPEND-OVERPAYMENT, RECEIVE-PREPAYMENT, SPEND-PREPAYMENT)
  - contactId: Contact ID
  - bankAccountId: Bank account ID
  - lineItems: Array of line items
  - date: Transaction date
  - reference: Reference`,
    {
      type: z.enum(['RECEIVE', 'SPEND', 'RECEIVE-OVERPAYMENT', 'SPEND-OVERPAYMENT', 'RECEIVE-PREPAYMENT', 'SPEND-PREPAYMENT']).describe('Transaction type'),
      contactId: z.string().describe('Contact ID'),
      bankAccountId: z.string().describe('Bank account ID'),
      lineItems: z.array(lineItemSchema).describe('Line items'),
      date: z.string().optional().describe('Transaction date'),
      reference: z.string().optional().describe('Reference'),
      currencyCode: z.string().optional().describe('Currency code'),
    },
    async ({ type, contactId, bankAccountId, lineItems, date, reference, currencyCode }) => {
      try {
        const transaction = await client.createBankTransaction({
          type,
          contact: { contactId },
          bankAccount: { accountId: bankAccountId },
          lineItems: lineItems as XeroLineItem[],
          date,
          reference,
          currencyCode,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Bank transaction created', transaction }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_bank_transaction',
    `Update a bank transaction.

Args:
  - bankTransactionId: Transaction ID to update
  - reference: Reference
  - date: Transaction date`,
    {
      bankTransactionId: z.string().describe('Bank transaction ID'),
      reference: z.string().optional().describe('Reference'),
      date: z.string().optional().describe('Transaction date'),
    },
    async ({ bankTransactionId, reference, date }) => {
      try {
        const transaction = await client.updateBankTransaction(bankTransactionId, { reference, date });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Bank transaction updated', transaction }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Bank Transfers
  server.tool(
    'xero_list_bank_transfers',
    `List bank transfers from Xero.

Args:
  - page: Page number
  - where: Filter expression`,
    {
      page: z.number().int().min(1).default(1).describe('Page number'),
      where: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ page, where, format }) => {
      try {
        const result = await client.listBankTransfers({ page, where });
        return formatResponse(result, format, 'bankTransfers');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_bank_transfer',
    `Get details for a specific bank transfer.

Args:
  - bankTransferId: Bank transfer ID`,
    {
      bankTransferId: z.string().describe('Bank transfer ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ bankTransferId, format }) => {
      try {
        const transfer = await client.getBankTransfer(bankTransferId);
        return formatResponse(transfer, format, 'bankTransfer');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_bank_transfer',
    `Create a bank transfer between two bank accounts.

Args:
  - fromBankAccountId: Source bank account ID
  - toBankAccountId: Destination bank account ID
  - amount: Transfer amount
  - date: Transfer date`,
    {
      fromBankAccountId: z.string().describe('From bank account ID'),
      toBankAccountId: z.string().describe('To bank account ID'),
      amount: z.number().describe('Amount'),
      date: z.string().optional().describe('Transfer date'),
    },
    async ({ fromBankAccountId, toBankAccountId, amount, date }) => {
      try {
        const transfer = await client.createBankTransfer({
          fromBankAccount: { accountId: fromBankAccountId },
          toBankAccount: { accountId: toBankAccountId },
          amount,
          date,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Bank transfer created', transfer }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
