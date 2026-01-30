/**
 * Contact Tools
 *
 * MCP tools for Xero contact management (customers and suppliers).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { XeroClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerContactTools(server: McpServer, client: XeroClient): void {
  server.tool(
    'xero_list_contacts',
    `List contacts (customers and suppliers) from Xero.

Returns a paginated list of contacts with basic details.

Args:
  - page: Page number (1-based)
  - where: Filter expression (e.g., 'ContactStatus=="ACTIVE"')
  - order: Sort order (e.g., 'Name ASC')
  - includeArchived: Include archived contacts`,
    {
      page: z.number().int().min(1).default(1).describe('Page number'),
      where: z.string().optional().describe('Filter expression'),
      order: z.string().optional().describe('Sort order'),
      includeArchived: z.boolean().default(false).describe('Include archived contacts'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ page, where, order, includeArchived, format }) => {
      try {
        const result = await client.listContacts({ page, where, order, includeArchived });
        return formatResponse(result, format, 'contacts');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_get_contact',
    `Get details for a specific contact.

Args:
  - contactId: The Xero contact ID`,
    {
      contactId: z.string().describe('Contact ID'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ contactId, format }) => {
      try {
        const contact = await client.getContact(contactId);
        return formatResponse(contact, format, 'contact');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_contact',
    `Create a new contact in Xero.

Args:
  - name: Contact name (required)
  - firstName: First name
  - lastName: Last name
  - emailAddress: Email address
  - isSupplier: Whether contact is a supplier
  - isCustomer: Whether contact is a customer
  - taxNumber: Tax/VAT number
  - defaultCurrency: Default currency code`,
    {
      name: z.string().describe('Contact name (required)'),
      firstName: z.string().optional().describe('First name'),
      lastName: z.string().optional().describe('Last name'),
      emailAddress: z.string().optional().describe('Email address'),
      isSupplier: z.boolean().optional().describe('Is supplier'),
      isCustomer: z.boolean().optional().describe('Is customer'),
      taxNumber: z.string().optional().describe('Tax/VAT number'),
      defaultCurrency: z.string().optional().describe('Default currency code'),
    },
    async (input) => {
      try {
        const contact = await client.createContact(input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Contact created', contact }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_update_contact',
    `Update an existing contact.

Args:
  - contactId: Contact ID to update
  - name: Contact name
  - firstName: First name
  - lastName: Last name
  - emailAddress: Email address
  - isSupplier: Whether contact is a supplier
  - isCustomer: Whether contact is a customer
  - contactStatus: Status (ACTIVE or ARCHIVED)`,
    {
      contactId: z.string().describe('Contact ID to update'),
      name: z.string().optional().describe('Contact name'),
      firstName: z.string().optional().describe('First name'),
      lastName: z.string().optional().describe('Last name'),
      emailAddress: z.string().optional().describe('Email address'),
      isSupplier: z.boolean().optional().describe('Is supplier'),
      isCustomer: z.boolean().optional().describe('Is customer'),
      contactStatus: z.enum(['ACTIVE', 'ARCHIVED']).optional().describe('Contact status'),
    },
    async ({ contactId, ...input }) => {
      try {
        const contact = await client.updateContact(contactId, input);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Contact updated', contact }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_archive_contact',
    `Archive a contact.

Args:
  - contactId: Contact ID to archive`,
    {
      contactId: z.string().describe('Contact ID to archive'),
    },
    async ({ contactId }) => {
      try {
        const contact = await client.archiveContact(contactId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Contact archived', contact }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Contact Groups
  server.tool(
    'xero_list_contact_groups',
    'List all contact groups.',
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const groups = await client.listContactGroups();
        return formatResponse({ items: groups, count: groups.length, hasMore: false }, format, 'contactGroups');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_create_contact_group',
    `Create a new contact group.

Args:
  - name: Group name`,
    {
      name: z.string().describe('Group name'),
    },
    async ({ name }) => {
      try {
        const group = await client.createContactGroup(name);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Contact group created', group }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'xero_add_contacts_to_group',
    `Add contacts to a contact group.

Args:
  - contactGroupId: Contact group ID
  - contactIds: Array of contact IDs to add`,
    {
      contactGroupId: z.string().describe('Contact group ID'),
      contactIds: z.array(z.string()).describe('Array of contact IDs'),
    },
    async ({ contactGroupId, contactIds }) => {
      try {
        const group = await client.addContactsToGroup(contactGroupId, contactIds);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: true, message: 'Contacts added to group', group }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
