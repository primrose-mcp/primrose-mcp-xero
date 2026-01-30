# Xero MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/xero)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for Xero, enabling AI assistants to manage accounting, invoicing, banking, and financial operations.

## Features

- **Organisation** - Access organisation settings and information
- **Contacts** - Manage customers and suppliers
- **Accounts** - Chart of accounts management
- **Invoices** - Create and manage sales invoices
- **Payments** - Process and track payments
- **Banking** - Bank transactions and reconciliation
- **Items** - Manage inventory items
- **Purchase Orders** - Create and manage purchase orders
- **Quotes** - Generate and manage quotes
- **Journals** - Manual journal entries
- **Reports** - Financial reports and analytics
- **Settings** - Tax rates, currencies, and configurations
- **Repeating Invoices** - Manage recurring invoices
- **Linked Transactions** - Track transaction relationships

## Quick Start

### Recommended: Use Primrose SDK

The easiest way to use this MCP server is with the Primrose SDK:

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseMCP } from 'primrose-mcp';

const primrose = new PrimroseMCP({
  apiKey: process.env.PRIMROSE_API_KEY,
});

const xeroClient = primrose.getClient('xero', {
  accessToken: process.env.XERO_ACCESS_TOKEN,
  tenantId: process.env.XERO_TENANT_ID,
});
```

## Manual Installation

### Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Xero account with API access

### Setup

1. Clone and install dependencies:

```bash
git clone <repository-url>
cd primrose-mcp-xero
npm install
```

2. Deploy to Cloudflare Workers:

```bash
npx wrangler deploy
```

## Configuration

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Xero-Access-Token` | OAuth 2.0 access token |
| `X-Xero-Tenant-Id` | Xero tenant/organization ID |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-Xero-Base-URL` | Override the default API base URL (default: https://api.xero.com/api.xro/2.0) |

### Example Request

```bash
curl -X POST https://your-worker.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "X-Xero-Access-Token: your-access-token" \
  -H "X-Xero-Tenant-Id: your-tenant-id" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

## Available Tools

### Organisation Tools
- `xero_get_organisation` - Get organisation details
- `xero_get_connections` - List connected organisations

### Contact Tools
- `xero_list_contacts` - List contacts
- `xero_get_contact` - Get contact details
- `xero_create_contact` - Create a contact
- `xero_update_contact` - Update a contact
- `xero_archive_contact` - Archive a contact

### Account Tools
- `xero_list_accounts` - List chart of accounts
- `xero_get_account` - Get account details
- `xero_create_account` - Create an account
- `xero_update_account` - Update an account
- `xero_archive_account` - Archive an account

### Invoice Tools
- `xero_list_invoices` - List invoices
- `xero_get_invoice` - Get invoice details
- `xero_create_invoice` - Create an invoice
- `xero_update_invoice` - Update an invoice
- `xero_void_invoice` - Void an invoice
- `xero_email_invoice` - Email an invoice

### Payment Tools
- `xero_list_payments` - List payments
- `xero_get_payment` - Get payment details
- `xero_create_payment` - Record a payment
- `xero_delete_payment` - Delete a payment

### Banking Tools
- `xero_list_bank_transactions` - List bank transactions
- `xero_get_bank_transaction` - Get transaction details
- `xero_create_bank_transaction` - Create a bank transaction
- `xero_list_bank_transfers` - List bank transfers
- `xero_create_bank_transfer` - Create a bank transfer

### Item Tools
- `xero_list_items` - List inventory items
- `xero_get_item` - Get item details
- `xero_create_item` - Create an item
- `xero_update_item` - Update an item
- `xero_delete_item` - Delete an item

### Purchase Order Tools
- `xero_list_purchase_orders` - List purchase orders
- `xero_get_purchase_order` - Get purchase order details
- `xero_create_purchase_order` - Create a purchase order
- `xero_update_purchase_order` - Update a purchase order

### Quote Tools
- `xero_list_quotes` - List quotes
- `xero_get_quote` - Get quote details
- `xero_create_quote` - Create a quote
- `xero_update_quote` - Update a quote

### Journal Tools
- `xero_list_journals` - List journal entries
- `xero_get_journal` - Get journal details
- `xero_create_manual_journal` - Create manual journal

### Report Tools
- `xero_get_profit_loss` - Profit and loss report
- `xero_get_balance_sheet` - Balance sheet report
- `xero_get_trial_balance` - Trial balance report
- `xero_get_aged_receivables` - Aged receivables report
- `xero_get_aged_payables` - Aged payables report

### Settings Tools
- `xero_list_tax_rates` - List tax rates
- `xero_list_currencies` - List currencies
- `xero_list_tracking_categories` - List tracking categories

### Repeating Invoice Tools
- `xero_list_repeating_invoices` - List repeating invoices
- `xero_get_repeating_invoice` - Get repeating invoice details

### Linked Transaction Tools
- `xero_list_linked_transactions` - List linked transactions
- `xero_create_linked_transaction` - Create linked transaction

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Type check
npm run typecheck

# Deploy
npm run deploy
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [Xero Developer Documentation](https://developer.xero.com/documentation/)
- [Xero Developer Portal](https://developer.xero.com)
- [Model Context Protocol](https://modelcontextprotocol.io)
