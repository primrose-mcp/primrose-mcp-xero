/**
 * Organisation Tools
 *
 * MCP tools for Xero organisation management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { XeroClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerOrganisationTools(server: McpServer, client: XeroClient): void {
  server.tool(
    'xero_test_connection',
    'Test the connection to the Xero API and return the connected organisation name.',
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return formatResponse(result, 'json', 'connection');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_organisation',
    `Get details about the connected Xero organisation.

Returns organisation information including name, country, currency, and settings.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const org = await client.getOrganisation();
        return formatResponse(org, format, 'organisation');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
