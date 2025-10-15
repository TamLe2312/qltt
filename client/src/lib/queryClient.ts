import { QueryClient } from '@tanstack/react-query';
import { API_CONFIG } from '../constants';

/**
 * React Query Configuration
 * Centralized query client setup with default options
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch configuration
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      
      // Error handling
      throwOnError: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      
      // Error handling
      throwOnError: false,
    },
  },
});

/**
 * Query Keys Factory
 * Centralized query key management for consistency
 */
export const queryKeys = {
  // Branches
  branches: {
    all: ['branches'] as const,
    lists: () => [...queryKeys.branches.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.branches.lists(), { filters }] as const,
    details: () => [...queryKeys.branches.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.branches.details(), id] as const,
  },
  
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    byBranch: (branchId: string) => [...queryKeys.products.all, 'byBranch', branchId] as const,
  },
  
  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.orders.lists(), { filters }] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
  
  // Users/Customers
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    charts: () => [...queryKeys.dashboard.all, 'charts'] as const,
    chart: (type: string) => [...queryKeys.dashboard.charts(), type] as const,
  },
} as const;

/**
 * Query Options Factory
 * Reusable query options with common configurations
 */
export const queryOptions = {
  // Standard list query
  list: <T>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<T>,
    options?: {
      enabled?: boolean;
      staleTime?: number;
    }
  ) => ({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
  }),
  
  // Detail query
  detail: <T>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<T>,
    options?: {
      enabled?: boolean;
      staleTime?: number;
    }
  ) => ({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 10 * 60 * 1000,
  }),
  
  // Infinite query for pagination
  infinite: <T>(
    queryKey: readonly unknown[],
    queryFn: ({ pageParam }: { pageParam?: number }) => Promise<T>,
    options?: {
      enabled?: boolean;
      staleTime?: number;
    }
  ) => ({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      // Implement pagination logic based on your API response
      return lastPage.hasNextPage ? lastPage.nextPage : undefined;
    },
  }),
} as const;
