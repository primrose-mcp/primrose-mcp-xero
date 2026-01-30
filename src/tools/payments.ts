/**
 * Payment Tools
 *
 * MCP tools for Xero payments, credit notes, prepayments, and overpayments.
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

export function registerPaymentTools(server: McpServer, client: XeroClient): void {
  // Payments
  server.tool(
    'xero_list_payments',
    `List payments from Xero.

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
        const result = await client.listPayments({ page, where, order });
        return formatResponse(result, format, 'payments');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_payment',
    `Get details for a specific payment.

Args:
  - paymentId: Payment ID`,
    {
      paymentId: z.string().describe('Payment ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ paymentId, format }) => {
      try {
        const payment = await client.getPayment(paymentId);
        return formatResponse(payment, format, 'payment');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_payment',
    `Create a payment for an invoice.

Args:
  - invoiceId: Invoice ID to pay
  - accountId: Bank account ID
  - amount: Payment amount
  - date: Payment date (YYYY-MM-DD)
  - reference: Payment reference
  - isReconciled: Mark as reconciled`,
    {
      invoiceId: z.string().describe('Invoice ID'),
      accountId: z.string().describe('Bank account ID'),
      amount: z.number().describe('Amount'),
      date: z.string().describe('Payment date'),
      reference: z.string().optional().describe('Reference'),
      isReconciled: z.boolean().optional().describe('Is reconciled'),
    },
    async ({ invoiceId, accountId, amount, date, reference, isReconciled }) => {
      try {
        const payment = await client.createPayment({
          invoice: { invoiceId },
          account: { accountId },
          amount,
          date,
          reference,
          isReconciled,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Payment created', payment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_delete_payment',
    `Delete a payment.

Args:
  - paymentId: Payment ID to delete`,
    {
      paymentId: z.string().describe('Payment ID to delete'),
    },
    async ({ paymentId }) => {
      try {
        await client.deletePayment(paymentId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Payment ${paymentId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Credit Notes
  server.tool(
    'xero_list_credit_notes',
    `List credit notes from Xero.

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
        const result = await client.listCreditNotes({ page, where, order });
        return formatResponse(result, format, 'creditNotes');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_credit_note',
    `Get details for a specific credit note.

Args:
  - creditNoteId: Credit note ID`,
    {
      creditNoteId: z.string().describe('Credit note ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ creditNoteId, format }) => {
      try {
        const creditNote = await client.getCreditNote(creditNoteId);
        return formatResponse(creditNote, format, 'creditNote');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_credit_note',
    `Create a credit note.

Args:
  - type: ACCRECCREDIT (customer) or ACCPAYCREDIT (supplier)
  - contactId: Contact ID
  - lineItems: Array of line items
  - date: Credit note date
  - reference: Reference`,
    {
      type: z.enum(['ACCRECCREDIT', 'ACCPAYCREDIT']).describe('Credit note type'),
      contactId: z.string().describe('Contact ID'),
      lineItems: z.array(lineItemSchema).describe('Line items'),
      date: z.string().optional().describe('Date'),
      reference: z.string().optional().describe('Reference'),
    },
    async ({ type, contactId, lineItems, date, reference }) => {
      try {
        const creditNote = await client.createCreditNote({
          type,
          contact: { contactId },
          lineItems: lineItems as XeroLineItem[],
          date,
          reference,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Credit note created', creditNote }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_allocate_credit_note',
    `Allocate a credit note to an invoice.

Args:
  - creditNoteId: Credit note ID
  - invoiceId: Invoice ID to allocate to
  - amount: Amount to allocate
  - date: Allocation date`,
    {
      creditNoteId: z.string().describe('Credit note ID'),
      invoiceId: z.string().describe('Invoice ID'),
      amount: z.number().describe('Amount'),
      date: z.string().optional().describe('Allocation date'),
    },
    async ({ creditNoteId, invoiceId, amount, date }) => {
      try {
        const creditNote = await client.allocateCreditNote(creditNoteId, invoiceId, amount, date);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Credit note allocated', creditNote }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Prepayments
  server.tool(
    'xero_list_prepayments',
    `List prepayments from Xero.

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
        const result = await client.listPrepayments({ page, where });
        return formatResponse(result, format, 'prepayments');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_allocate_prepayment',
    `Allocate a prepayment to an invoice.

Args:
  - prepaymentId: Prepayment ID
  - invoiceId: Invoice ID to allocate to
  - amount: Amount to allocate
  - date: Allocation date`,
    {
      prepaymentId: z.string().describe('Prepayment ID'),
      invoiceId: z.string().describe('Invoice ID'),
      amount: z.number().describe('Amount'),
      date: z.string().optional().describe('Allocation date'),
    },
    async ({ prepaymentId, invoiceId, amount, date }) => {
      try {
        const prepayment = await client.allocatePrepayment(prepaymentId, invoiceId, amount, date);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Prepayment allocated', prepayment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Overpayments
  server.tool(
    'xero_list_overpayments',
    `List overpayments from Xero.

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
        const result = await client.listOverpayments({ page, where });
        return formatResponse(result, format, 'overpayments');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_allocate_overpayment',
    `Allocate an overpayment to an invoice.

Args:
  - overpaymentId: Overpayment ID
  - invoiceId: Invoice ID to allocate to
  - amount: Amount to allocate
  - date: Allocation date`,
    {
      overpaymentId: z.string().describe('Overpayment ID'),
      invoiceId: z.string().describe('Invoice ID'),
      amount: z.number().describe('Amount'),
      date: z.string().optional().describe('Allocation date'),
    },
    async ({ overpaymentId, invoiceId, amount, date }) => {
      try {
        const overpayment = await client.allocateOverpayment(overpaymentId, invoiceId, amount, date);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Overpayment allocated', overpayment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Batch Payments
  server.tool(
    'xero_list_batch_payments',
    `List batch payments from Xero.

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
        const result = await client.listBatchPayments({ page, where });
        return formatResponse(result, format, 'batchPayments');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
