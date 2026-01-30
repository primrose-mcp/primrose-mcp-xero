/**
 * Xero MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It supports both stateless (McpServer) and stateful (McpAgent) modes.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (API keys, etc.) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-Xero-Access-Token: OAuth 2.0 access token for Xero authentication
 * - X-Xero-Tenant-Id: Xero tenant ID (organization identifier)
 *
 * Optional Headers:
 * - X-Xero-Base-URL: Override the default Xero API base URL
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createXeroClient } from './client.js';
import {
  registerOrganisationTools,
  registerContactTools,
  registerAccountTools,
  registerInvoiceTools,
  registerPaymentTools,
  registerBankingTools,
  registerItemTools,
  registerPurchaseOrderTools,
  registerQuoteTools,
  registerJournalTools,
  registerReportTools,
  registerSettingsTools,
  registerRepeatingInvoiceTools,
  registerLinkedTransactionTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'xero-mcp-server';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode (Option 2) instead.
 * The stateful McpAgent is better suited for single-tenant deployments where
 * credentials can be stored as wrangler secrets.
 *
 * @deprecated For multi-tenant support, use stateless mode with per-request credentials
 */
export class XeroMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-Xero-Access-Token and X-Xero-Tenant-Id headers instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides credentials via headers, allowing
 * a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createXeroClient(credentials);

  // Register all Xero tools
  registerOrganisationTools(server, client);
  registerContactTools(server, client);
  registerAccountTools(server, client);
  registerInvoiceTools(server, client);
  registerPaymentTools(server, client);
  registerBankingTools(server, client);
  registerItemTools(server, client);
  registerPurchaseOrderTools(server, client);
  registerQuoteTools(server, client);
  registerJournalTools(server, client);
  registerReportTools(server, client);
  registerSettingsTools(server, client);
  registerRepeatingInvoiceTools(server, client);
  registerLinkedTransactionTools(server, client);

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-Xero-Access-Token', 'X-Xero-Tenant-Id'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Multi-tenant Xero Accounting MCP Server',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-Xero-Access-Token': 'OAuth 2.0 access token for Xero authentication',
            'X-Xero-Tenant-Id': 'Xero tenant ID (organization identifier)',
          },
          optional_headers: {
            'X-Xero-Base-URL': 'Override the default Xero API base URL (default: https://api.xero.com/api.xro/2.0)',
          },
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
