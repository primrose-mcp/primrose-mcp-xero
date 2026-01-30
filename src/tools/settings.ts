/**
 * Settings Tools
 *
 * MCP tools for Xero settings: tracking categories, tax rates, currencies, branding themes, users.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { XeroClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerSettingsTools(server: McpServer, client: XeroClient): void {
  // Tracking Categories
  server.tool(
    'xero_list_tracking_categories',
    `List tracking categories from Xero.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const categories = await client.listTrackingCategories();
        return formatResponse({ items: categories, count: categories.length }, format, 'trackingCategories');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_tracking_category',
    `Get details for a specific tracking category.

Args:
  - trackingCategoryId: Tracking category ID`,
    {
      trackingCategoryId: z.string().describe('Tracking category ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ trackingCategoryId, format }) => {
      try {
        const category = await client.getTrackingCategory(trackingCategoryId);
        return formatResponse(category, format, 'trackingCategory');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_tracking_category',
    `Create a new tracking category.

Args:
  - name: Category name (required)`,
    {
      name: z.string().describe('Category name'),
    },
    async ({ name }) => {
      try {
        const category = await client.createTrackingCategory(name);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Tracking category created', category }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_tracking_category',
    `Update a tracking category.

Args:
  - trackingCategoryId: Tracking category ID
  - name: Category name`,
    {
      trackingCategoryId: z.string().describe('Tracking category ID'),
      name: z.string().describe('Category name'),
    },
    async ({ trackingCategoryId, name }) => {
      try {
        const category = await client.updateTrackingCategory(trackingCategoryId, name);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Tracking category updated', category }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_delete_tracking_category',
    `Delete a tracking category.

Args:
  - trackingCategoryId: Tracking category ID to delete`,
    {
      trackingCategoryId: z.string().describe('Tracking category ID to delete'),
    },
    async ({ trackingCategoryId }) => {
      try {
        await client.deleteTrackingCategory(trackingCategoryId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Tracking category ${trackingCategoryId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_tracking_option',
    `Create a tracking option within a category.

Args:
  - trackingCategoryId: Tracking category ID
  - name: Option name (required)`,
    {
      trackingCategoryId: z.string().describe('Tracking category ID'),
      name: z.string().describe('Option name'),
    },
    async ({ trackingCategoryId, name }) => {
      try {
        const option = await client.createTrackingOption(trackingCategoryId, name);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Tracking option created', option }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_tracking_option',
    `Update a tracking option.

Args:
  - trackingCategoryId: Tracking category ID
  - trackingOptionId: Tracking option ID
  - name: Option name`,
    {
      trackingCategoryId: z.string().describe('Tracking category ID'),
      trackingOptionId: z.string().describe('Tracking option ID'),
      name: z.string().describe('Option name'),
    },
    async ({ trackingCategoryId, trackingOptionId, name }) => {
      try {
        const option = await client.updateTrackingOption(trackingCategoryId, trackingOptionId, name);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Tracking option updated', option }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_delete_tracking_option',
    `Delete a tracking option.

Args:
  - trackingCategoryId: Tracking category ID
  - trackingOptionId: Tracking option ID to delete`,
    {
      trackingCategoryId: z.string().describe('Tracking category ID'),
      trackingOptionId: z.string().describe('Tracking option ID to delete'),
    },
    async ({ trackingCategoryId, trackingOptionId }) => {
      try {
        await client.deleteTrackingOption(trackingCategoryId, trackingOptionId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: `Tracking option ${trackingOptionId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Tax Rates
  server.tool(
    'xero_list_tax_rates',
    `List tax rates from Xero.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const taxRates = await client.listTaxRates();
        return formatResponse({ items: taxRates, count: taxRates.length }, format, 'taxRates');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_tax_rate',
    `Get details for a specific tax rate.

Args:
  - taxType: Tax type identifier`,
    {
      taxType: z.string().describe('Tax type'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ taxType, format }) => {
      try {
        const taxRate = await client.getTaxRate(taxType);
        return formatResponse(taxRate, format, 'taxRate');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_tax_rate',
    `Create a new tax rate.

Args:
  - name: Tax rate name (required)
  - taxComponents: Array of tax components with name and rate
  - status: Status (ACTIVE, DELETED, ARCHIVED)
  - reportTaxType: Report tax type (e.g., OUTPUT, INPUT, EXEMPTOUTPUT, EXEMPTINPUT)`,
    {
      name: z.string().describe('Tax rate name'),
      taxComponents: z.array(z.object({
        name: z.string().describe('Component name'),
        rate: z.number().describe('Component rate'),
      })).describe('Tax components'),
      status: z.enum(['ACTIVE', 'DELETED', 'ARCHIVED']).optional().describe('Status'),
      reportTaxType: z.enum([
        'OUTPUT', 'INPUT', 'EXEMPTOUTPUT', 'EXEMPTINPUT', 'BASEXCLUDED',
        'GSTONIMPORTS', 'ECACQUISITIONS', 'CAPITALSALESOUTPUT', 'CAPITALEXPENSESINPUT',
        'ECOUTPUT', 'ECOUTPUTSERVICES'
      ]).optional().describe('Report tax type'),
    },
    async ({ name, taxComponents, status, reportTaxType }) => {
      try {
        const taxRate = await client.createTaxRate({ name, taxComponents, status, reportTaxType });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Tax rate created', taxRate }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_tax_rate',
    `Update a tax rate.

Args:
  - taxType: Tax type to update
  - name: Tax rate name
  - status: Status (ACTIVE, DELETED, ARCHIVED)
  - reportTaxType: Report tax type`,
    {
      taxType: z.string().describe('Tax type'),
      name: z.string().optional().describe('Tax rate name'),
      status: z.enum(['ACTIVE', 'DELETED', 'ARCHIVED']).optional().describe('Status'),
      reportTaxType: z.enum([
        'OUTPUT', 'INPUT', 'EXEMPTOUTPUT', 'EXEMPTINPUT', 'BASEXCLUDED',
        'GSTONIMPORTS', 'ECACQUISITIONS', 'CAPITALSALESOUTPUT', 'CAPITALEXPENSESINPUT',
        'ECOUTPUT', 'ECOUTPUTSERVICES'
      ]).optional().describe('Report tax type'),
    },
    async ({ taxType, name, status, reportTaxType }) => {
      try {
        const taxRate = await client.updateTaxRate({ taxType, name, status, reportTaxType });
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Tax rate updated', taxRate }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Currencies
  server.tool(
    'xero_list_currencies',
    `List currencies from Xero.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const currencies = await client.listCurrencies();
        return formatResponse({ items: currencies, count: currencies.length }, format, 'currencies');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_currency',
    `Add a currency to the organisation.

Args:
  - code: Currency code (required, e.g., USD, EUR, GBP)
  - description: Currency description`,
    {
      code: z.string().describe('Currency code'),
      description: z.string().optional().describe('Currency description'),
    },
    async ({ code, description }) => {
      try {
        const currency = await client.createCurrency(code, description);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Currency added', currency }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Branding Themes
  server.tool(
    'xero_list_branding_themes',
    `List branding themes from Xero.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const themes = await client.listBrandingThemes();
        return formatResponse({ items: themes, count: themes.length }, format, 'brandingThemes');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_branding_theme',
    `Get details for a specific branding theme.

Args:
  - brandingThemeId: Branding theme ID`,
    {
      brandingThemeId: z.string().describe('Branding theme ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ brandingThemeId, format }) => {
      try {
        const theme = await client.getBrandingTheme(brandingThemeId);
        return formatResponse(theme, format, 'brandingTheme');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Users
  server.tool(
    'xero_list_users',
    `List users from Xero.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const users = await client.listUsers();
        return formatResponse({ items: users, count: users.length }, format, 'users');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_user',
    `Get details for a specific user.

Args:
  - userId: User ID`,
    {
      userId: z.string().describe('User ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ userId, format }) => {
      try {
        const user = await client.getUser(userId);
        return formatResponse(user, format, 'user');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
