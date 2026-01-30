/**
 * Pagination Utilities
 *
 * Helpers for handling pagination across Xero API endpoints.
 */

import type { PaginatedResponse, PaginationParams } from '../types/entities.js';

/**
 * Default pagination settings for Xero
 */
export const PAGINATION_DEFAULTS = {
  page: 1,
  maxPage: 100,
} as const;

/**
 * Normalize pagination parameters for Xero
 */
export function normalizePaginationParams(
  params?: PaginationParams
): Required<Pick<PaginationParams, 'page'>> & Omit<PaginationParams, 'page'> {
  return {
    page: params?.page || PAGINATION_DEFAULTS.page,
    where: params?.where,
    order: params?.order,
  };
}

/**
 * Create an empty paginated response
 */
export function emptyPaginatedResponse<T>(): PaginatedResponse<T> {
  return {
    items: [],
    count: 0,
    hasMore: false,
  };
}

/**
 * Create a paginated response from an array
 */
export function createPaginatedResponse<T>(
  items: T[],
  options: {
    page?: number;
    hasMore?: boolean;
  } = {}
): PaginatedResponse<T> {
  return {
    items,
    count: items.length,
    page: options.page,
    hasMore: options.hasMore ?? false,
  };
}

/**
 * Calculate if there are more items based on page size
 * Xero typically returns up to 100 items per page
 */
export function hasMoreItems(itemCount: number, pageSize: number = 100): boolean {
  return itemCount >= pageSize;
}

/**
 * Get the next page number
 */
export function getNextPage(currentPage: number, hasMore: boolean): number | undefined {
  return hasMore ? currentPage + 1 : undefined;
}
