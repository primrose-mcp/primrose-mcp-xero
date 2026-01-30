/**
 * Item Tools
 *
 * MCP tools for Xero items/products management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { XeroClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerItemTools(server: McpServer, client: XeroClient): void {
  server.tool(
    'xero_list_items',
    `List items/products from Xero.

Args:
  - where: Filter expression`,
    {
      where: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ where, format }) => {
      try {
        const items = await client.listItems({ where });
        return formatResponse({ items, count: items.length, hasMore: false }, format, 'items');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_item',
    `Get details for a specific item.

Args:
  - itemId: Item ID`,
    {
      itemId: z.string().describe('Item ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ itemId, format }) => {
      try {
        const item = await client.getItem(itemId);
        return formatResponse(item, format, 'item');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_item',
    `Create a new item/product.

Args:
  - code: Item code (required)
  - name: Item name
  - description: Sales description
  - purchaseDescription: Purchase description
  - salesUnitPrice: Sales unit price
  - salesAccountCode: Sales account code
  - salesTaxType: Sales tax type
  - purchaseUnitPrice: Purchase unit price
  - purchaseAccountCode: Purchase account code
  - purchaseTaxType: Purchase tax type
  - isTrackedAsInventory: Track as inventory
  - inventoryAssetAccountCode: Inventory asset account code`,
    {
      code: z.string().describe('Item code'),
      name: z.string().optional().describe('Item name'),
      description: z.string().optional().describe('Sales description'),
      purchaseDescription: z.string().optional().describe('Purchase description'),
      salesUnitPrice: z.number().optional().describe('Sales unit price'),
      salesAccountCode: z.string().optional().describe('Sales account code'),
      salesTaxType: z.string().optional().describe('Sales tax type'),
      purchaseUnitPrice: z.number().optional().describe('Purchase unit price'),
      purchaseAccountCode: z.string().optional().describe('Purchase account code'),
      purchaseTaxType: z.string().optional().describe('Purchase tax type'),
      isTrackedAsInventory: z.boolean().optional().describe('Track as inventory'),
      inventoryAssetAccountCode: z.string().optional().describe('Inventory asset account code'),
      isSold: z.boolean().optional().describe('Is sold'),
      isPurchased: z.boolean().optional().describe('Is purchased'),
    },
    async ({
      code,
      name,
      description,
      purchaseDescription,
      salesUnitPrice,
      salesAccountCode,
      salesTaxType,
      purchaseUnitPrice,
      purchaseAccountCode,
      purchaseTaxType,
      isTrackedAsInventory,
      inventoryAssetAccountCode,
      isSold,
      isPurchased,
    }) => {
      try {
        const item = await client.createItem({
          code,
          name,
          description,
          purchaseDescription,
          salesDetails: salesUnitPrice || salesAccountCode || salesTaxType ? {
            unitPrice: salesUnitPrice,
            accountCode: salesAccountCode,
            taxType: salesTaxType,
          } : undefined,
          purchaseDetails: purchaseUnitPrice || purchaseAccountCode || purchaseTaxType ? {
            unitPrice: purchaseUnitPrice,
            accountCode: purchaseAccountCode,
            taxType: purchaseTaxType,
          } : undefined,
          isTrackedAsInventory,
          inventoryAssetAccountCode,
          isSold,
          isPurchased,
        });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Item created', item }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_item',
    `Update an existing item.

Args:
  - itemId: Item ID to update
  - code: Item code
  - name: Item name
  - description: Sales description
  - purchaseDescription: Purchase description`,
    {
      itemId: z.string().describe('Item ID'),
      code: z.string().optional().describe('Item code'),
      name: z.string().optional().describe('Item name'),
      description: z.string().optional().describe('Sales description'),
      purchaseDescription: z.string().optional().describe('Purchase description'),
    },
    async ({ itemId, ...input }) => {
      try {
        const item = await client.updateItem(itemId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Item updated', item }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_delete_item',
    `Delete an item.

Args:
  - itemId: Item ID to delete`,
    {
      itemId: z.string().describe('Item ID to delete'),
    },
    async ({ itemId }) => {
      try {
        await client.deleteItem(itemId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Item ${itemId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
