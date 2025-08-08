import { QueryClient } from '@tanstack/react-query'

// Server-side QueryClient factory
export function createServerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Set staleTime to prevent immediate refetching on the client
        staleTime: 60 * 1000, // 60 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        retry: false, // Disable retries on server
      },
    },
  })
}

// Client-side QueryClient factory  
export function createClientQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5分
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // 401エラーの場合はリトライしない
          if (error instanceof Error && error.message.includes('401')) {
            return false
          }
          return failureCount < 3
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}