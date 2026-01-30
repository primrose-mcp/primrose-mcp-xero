/**
 * Account Tools
 *
 * MCP tools for Xero Chart of Accounts management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { XeroClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const accountTypeEnum = z.enum([
  'BANK', 'CURRENT', 'CURRLIAB', 'DEPRECIATN', 'DIRECTCOSTS', 'EQUITY',
  'EXPENSE', 'FIXED', 'INVENTORY', 'LIABILITY', 'NONCURRENT', 'OTHERINCOME',
  'OVERHEADS', 'PREPAYMENT', 'REVENUE', 'SALES', 'TERMLIAB', 'PAYGLIABILITY',
  'SUPERANNUATIONEXPENSE', 'SUPERANNUATIONLIABILITY', 'WAGESEXPENSE', 'WAGESPAYABLELIABILITY'
]);

export function registerAccountTools(server: McpServer, client: XeroClient): void {
  server.tool(
    'xero_list_accounts',
    `List accounts from the Chart of Accounts.

Args:
  - where: Filter expression
  - classType: Filter by account class (ASSET, EQUITY, EXPENSE, LIABILITY, REVENUE)`,
    {
      where: z.string().optional().describe('Filter expression'),
      classType: z.enum(['ASSET', 'EQUITY', 'EXPENSE', 'LIABILITY', 'REVENUE']).optional().describe('Account class'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ where, classType, format }) => {
      try {
        const accounts = await client.listAccounts({ where, classType });
        return formatResponse({ items: accounts, count: accounts.length, hasMore: false }, format, 'accounts');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_account',
    `Get details for a specific account.

Args:
  - accountId: The account ID`,
    {
      accountId: z.string().describe('Account ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ accountId, format }) => {
      try {
        const account = await client.getAccount(accountId);
        return formatResponse(account, format, 'account');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_account',
    `Create a new account in the Chart of Accounts.

Args:
  - code: Account code
  - name: Account name
  - type: Account type
  - description: Account description
  - taxType: Tax type
  - enablePaymentsToAccount: Allow payments to this account
  - showInExpenseClaims: Show in expense claims`,
    {
      code: z.string().describe('Account code'),
      name: z.string().describe('Account name'),
      type: accountTypeEnum.describe('Account type'),
      description: z.string().optional().describe('Description'),
      taxType: z.string().optional().describe('Tax type'),
      enablePaymentsToAccount: z.boolean().optional().describe('Enable payments to account'),
      showInExpenseClaims: z.boolean().optional().describe('Show in expense claims'),
    },
    async (input) => {
      try {
        const account = await client.createAccount(input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Account created', account }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_account',
    `Update an existing account.

Args:
  - accountId: Account ID to update
  - code: Account code
  - name: Account name
  - description: Account description
  - status: Account status (ACTIVE or ARCHIVED)`,
    {
      accountId: z.string().describe('Account ID to update'),
      code: z.string().optional().describe('Account code'),
      name: z.string().optional().describe('Account name'),
      description: z.string().optional().describe('Description'),
      status: z.enum(['ACTIVE', 'ARCHIVED']).optional().describe('Account status'),
    },
    async ({ accountId, ...input }) => {
      try {
        const account = await client.updateAccount(accountId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Account updated', account }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_delete_account',
    `Delete an account from the Chart of Accounts. Only accounts without transactions can be deleted.

Args:
  - accountId: Account ID to delete`,
    {
      accountId: z.string().describe('Account ID to delete'),
    },
    async ({ accountId }) => {
      try {
        await client.deleteAccount(accountId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Account ${accountId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
