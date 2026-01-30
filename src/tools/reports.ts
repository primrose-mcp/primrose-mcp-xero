/**
 * Report Tools
 *
 * MCP tools for Xero financial reports.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { XeroClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerReportTools(server: McpServer, client: XeroClient): void {
  server.tool(
    'xero_get_balance_sheet',
    `Get the Balance Sheet report.

Args:
  - date: Report date (YYYY-MM-DD)
  - periods: Number of periods to compare
  - timeframe: Timeframe (MONTH, QUARTER, YEAR)
  - trackingOptionId1: First tracking option ID
  - trackingOptionId2: Second tracking option ID
  - standardLayout: Use standard layout
  - paymentsOnly: Cash basis (payments only)`,
    {
      date: z.string().optional().describe('Report date'),
      periods: z.number().int().optional().describe('Number of periods'),
      timeframe: z.enum(['MONTH', 'QUARTER', 'YEAR']).optional().describe('Timeframe'),
      trackingOptionId1: z.string().optional().describe('Tracking option ID 1'),
      trackingOptionId2: z.string().optional().describe('Tracking option ID 2'),
      standardLayout: z.boolean().optional().describe('Standard layout'),
      paymentsOnly: z.boolean().optional().describe('Cash basis'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ date, periods, timeframe, trackingOptionId1, trackingOptionId2, standardLayout, paymentsOnly, format }) => {
      try {
        const report = await client.getBalanceSheet({
          date,
          periods,
          timeframe,
          trackingOptionId1,
          trackingOptionId2,
          standardLayout,
          paymentsOnly,
        });
        return formatResponse(report, format, 'report');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_profit_and_loss',
    `Get the Profit and Loss report.

Args:
  - fromDate: Start date (YYYY-MM-DD)
  - toDate: End date (YYYY-MM-DD)
  - periods: Number of periods to compare
  - timeframe: Timeframe (MONTH, QUARTER, YEAR)
  - trackingCategoryId: Tracking category ID
  - trackingOptionId: Tracking option ID
  - standardLayout: Use standard layout
  - paymentsOnly: Cash basis (payments only)`,
    {
      fromDate: z.string().optional().describe('Start date'),
      toDate: z.string().optional().describe('End date'),
      periods: z.number().int().optional().describe('Number of periods'),
      timeframe: z.enum(['MONTH', 'QUARTER', 'YEAR']).optional().describe('Timeframe'),
      trackingCategoryId: z.string().optional().describe('Tracking category ID'),
      trackingOptionId: z.string().optional().describe('Tracking option ID'),
      standardLayout: z.boolean().optional().describe('Standard layout'),
      paymentsOnly: z.boolean().optional().describe('Cash basis'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ fromDate, toDate, periods, timeframe, trackingCategoryId, trackingOptionId, standardLayout, paymentsOnly, format }) => {
      try {
        const report = await client.getProfitAndLoss({
          fromDate,
          toDate,
          periods,
          timeframe,
          trackingCategoryId,
          trackingOptionId,
          standardLayout,
          paymentsOnly,
        });
        return formatResponse(report, format, 'report');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_trial_balance',
    `Get the Trial Balance report.

Args:
  - date: Report date (YYYY-MM-DD)
  - paymentsOnly: Cash basis (payments only)`,
    {
      date: z.string().optional().describe('Report date'),
      paymentsOnly: z.boolean().optional().describe('Cash basis'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ date, paymentsOnly, format }) => {
      try {
        const report = await client.getTrialBalance({ date, paymentsOnly });
        return formatResponse(report, format, 'report');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_bank_summary',
    `Get the Bank Summary report.

Args:
  - fromDate: Start date (YYYY-MM-DD)
  - toDate: End date (YYYY-MM-DD)`,
    {
      fromDate: z.string().optional().describe('Start date'),
      toDate: z.string().optional().describe('End date'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ fromDate, toDate, format }) => {
      try {
        const report = await client.getBankSummary({ fromDate, toDate });
        return formatResponse(report, format, 'report');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_aged_receivables_by_contact',
    `Get the Aged Receivables by Contact report.

Args:
  - contactId: Contact ID (required)
  - date: Report date (YYYY-MM-DD)
  - fromDate: From date
  - toDate: To date`,
    {
      contactId: z.string().describe('Contact ID'),
      date: z.string().optional().describe('Report date'),
      fromDate: z.string().optional().describe('From date'),
      toDate: z.string().optional().describe('To date'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ contactId, date, fromDate, toDate, format }) => {
      try {
        const report = await client.getAgedReceivablesByContact({ contactId, date, fromDate, toDate });
        return formatResponse(report, format, 'report');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_aged_payables_by_contact',
    `Get the Aged Payables by Contact report.

Args:
  - contactId: Contact ID (required)
  - date: Report date (YYYY-MM-DD)
  - fromDate: From date
  - toDate: To date`,
    {
      contactId: z.string().describe('Contact ID'),
      date: z.string().optional().describe('Report date'),
      fromDate: z.string().optional().describe('From date'),
      toDate: z.string().optional().describe('To date'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ contactId, date, fromDate, toDate, format }) => {
      try {
        const report = await client.getAgedPayablesByContact({ contactId, date, fromDate, toDate });
        return formatResponse(report, format, 'report');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_budget_summary',
    `Get the Budget Summary report.

Args:
  - date: Report date
  - periods: Number of periods
  - timeframe: Timeframe`,
    {
      date: z.string().optional().describe('Report date'),
      periods: z.number().int().optional().describe('Number of periods'),
      timeframe: z.number().int().optional().describe('Timeframe'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ date, periods, timeframe, format }) => {
      try {
        const report = await client.getBudgetSummary({ date, periods, timeframe });
        return formatResponse(report, format, 'report');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_executive_summary',
    `Get the Executive Summary report.

Args:
  - date: Report date`,
    {
      date: z.string().optional().describe('Report date'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ date, format }) => {
      try {
        const report = await client.getExecutiveSummary({ date });
        return formatResponse(report, format, 'report');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_report',
    `Get any Xero report by name with custom parameters.

Args:
  - reportName: Report name (e.g., 'BalanceSheet', 'ProfitAndLoss', 'TrialBalance', 'BankSummary', 'BudgetSummary', 'ExecutiveSummary', 'AgedReceivablesByContact', 'AgedPayablesByContact', '1099Report', 'TenNinetyNine')
  - params: Report parameters as key-value pairs`,
    {
      reportName: z.string().describe('Report name'),
      params: z.record(z.string(), z.string()).optional().describe('Report parameters'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ reportName, params, format }) => {
      try {
        const report = await client.getReport(reportName, params);
        return formatResponse(report, format, 'report');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
