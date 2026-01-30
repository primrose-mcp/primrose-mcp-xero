/**
 * Purchase Order Tools
 *
 * MCP tools for Xero purchase order management.
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

export function registerPurchaseOrderTools(server: McpServer, client: XeroClient): void {
  server.tool(
    'xero_list_purchase_orders',
    `List purchase orders from Xero.

Args:
  - page: Page number
  - where: Filter expression
  - order: Sort order
  - status: Filter by status (DRAFT, SUBMITTED, AUTHORISED, BILLED, DELETED)`,
    {
      page: z.number().int().min(1).default(1).describe('Page number'),
      where: z.string().optional().describe('Filter expression'),
      order: z.string().optional().describe('Sort order'),
      status: z.string().optional().describe('Status filter'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ page, where, order, status, format }) => {
      try {
        const result = await client.listPurchaseOrders({ page, where, order, status });
        return formatResponse(result, format, 'purchaseOrders');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_purchase_order',
    `Get details for a specific purchase order.

Args:
  - purchaseOrderId: Purchase order ID`,
    {
      purchaseOrderId: z.string().describe('Purchase order ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ purchaseOrderId, format }) => {
      try {
        const order = await client.getPurchaseOrder(purchaseOrderId);
        return formatResponse(order, format, 'purchaseOrder');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_purchase_order',
    `Create a new purchase order.

Args:
  - contactId: Supplier contact ID
  - lineItems: Array of line items
  - date: Order date
  - deliveryDate: Expected delivery date
  - reference: Reference
  - deliveryAddress: Delivery address
  - attentionTo: Attention to
  - telephone: Telephone
  - deliveryInstructions: Delivery instructions
  - status: Status (DRAFT, SUBMITTED, AUTHORISED)`,
    {
      contactId: z.string().describe('Supplier contact ID'),
      lineItems: z.array(lineItemSchema).describe('Line items'),
      date: z.string().optional().describe('Order date'),
      deliveryDate: z.string().optional().describe('Delivery date'),
      reference: z.string().optional().describe('Reference'),
      deliveryAddress: z.string().optional().describe('Delivery address'),
      attentionTo: z.string().optional().describe('Attention to'),
      telephone: z.string().optional().describe('Telephone'),
      deliveryInstructions: z.string().optional().describe('Delivery instructions'),
      status: z.enum(['DRAFT', 'SUBMITTED', 'AUTHORISED']).optional().describe('Status'),
      currencyCode: z.string().optional().describe('Currency code'),
    },
    async ({ contactId, lineItems, date, deliveryDate, reference, deliveryAddress, attentionTo, telephone, deliveryInstructions, status, currencyCode }) => {
      try {
        const order = await client.createPurchaseOrder({
          contact: { contactId },
          lineItems: lineItems as XeroLineItem[],
          date,
          deliveryDate,
          reference,
          deliveryAddress,
          attentionTo,
          telephone,
          deliveryInstructions,
          status,
          currencyCode,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Purchase order created', order }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_purchase_order',
    `Update an existing purchase order.

Args:
  - purchaseOrderId: Purchase order ID to update
  - reference: Reference
  - date: Order date
  - deliveryDate: Delivery date
  - status: Status`,
    {
      purchaseOrderId: z.string().describe('Purchase order ID'),
      reference: z.string().optional().describe('Reference'),
      date: z.string().optional().describe('Order date'),
      deliveryDate: z.string().optional().describe('Delivery date'),
      status: z.enum(['DRAFT', 'SUBMITTED', 'AUTHORISED']).optional().describe('Status'),
    },
    async ({ purchaseOrderId, ...input }) => {
      try {
        const order = await client.updatePurchaseOrder(purchaseOrderId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Purchase order updated', order }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_delete_purchase_order',
    `Delete a purchase order.

Args:
  - purchaseOrderId: Purchase order ID to delete`,
    {
      purchaseOrderId: z.string().describe('Purchase order ID to delete'),
    },
    async ({ purchaseOrderId }) => {
      try {
        await client.deletePurchaseOrder(purchaseOrderId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Purchase order ${purchaseOrderId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
