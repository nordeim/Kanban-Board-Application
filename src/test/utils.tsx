import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

// Create a custom render function that includes all providers
interface AllTheProvidersProps {
  children: React.ReactNode
  session?: any
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ 
  children, 
  session = null 
}) => {
  const testQueryClient = createTestQueryClient()
  
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={testQueryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { session?: any }
) => {
  const { session, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders session={session}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export { createMockDeal, createMockUser, createMockSponsor } from './factories'

// Custom matchers
export { toHaveNoAccessibilityViolations } from './matchers'

// Test helpers
export const waitForLoadingToFinish = () =>
  waitFor(() => {
    expect(screen.queryAllByTestId('loading')).toHaveLength(0)
  })
