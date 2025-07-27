import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { CreateDealDialog } from '@/components/deals/CreateDealDialog'
import { createDeal } from '@/app/actions/deals'

// Mock the server action
jest.mock('@/app/actions/deals', () => ({
  createDeal: jest.fn(),
}))

// Mock API calls
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn().mockImplementation(({ queryKey }) => {
    if (queryKey[0] === 'sponsors') {
      return {
        data: [
          { id: '1', name: 'Test Sponsor 1', companyName: 'Company 1' },
          { id: '2', name: 'Test Sponsor 2', companyName: 'Company 2' },
        ],
        isLoading: false,
      }
    }
    if (queryKey[0] === 'tags') {
      return {
        data: [
          { id: '1', name: 'Tech', color: '#3b82f6' },
          { id: '2', name: 'Gaming', color: '#22c55e' },
        ],
        isLoading: false,
      }
    }
    if (queryKey[0] === 'team-members') {
      return {
        data: [
          { id: '1', name: 'John Doe', email: 'john@example.com' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        ],
        isLoading: false,
      }
    }
    return { data: [], isLoading: false }
  }),
}))

describe('CreateDealDialog', () => {
  const mockOnOpenChange = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dialog when open', () => {
    render(
      <CreateDealDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    expect(screen.getByText('Create New Sponsorship Deal')).toBeInTheDocument()
    expect(screen.getByText('Sponsor')).toBeInTheDocument()
  })

  it('navigates through form steps', async () => {
    const user = userEvent.setup()
    
    render(
      <CreateDealDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    // Step 1: Sponsor
    expect(screen.getByText('Select Sponsor')).toBeInTheDocument()
    
    // Select a sponsor
    const sponsorSelect = screen.getByRole('combobox', { name: /select sponsor/i })
    await user.click(sponsorSelect)
    await user.click(screen.getByText('Test Sponsor 1'))

    // Go to next step
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    // Step 2: Deal Details
    expect(screen.getByLabelText('Deal Title')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    
    render(
      <CreateDealDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    // Try to go to next step without selecting sponsor
    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()

    // Select sponsor to enable next
    const sponsorSelect = screen.getByRole('combobox', { name: /select sponsor/i })
    await user.click(sponsorSelect)
    await user.click(screen.getByText('Test Sponsor 1'))

    expect(nextButton).not.toBeDisabled()
  })

  it('creates a new sponsor when using new sponsor tab', async () => {
    const user = userEvent.setup()
    
    render(
      <CreateDealDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    // Switch to new sponsor tab
    const newSponsorTab = screen.getByRole('tab', { name: /new sponsor/i })
    await user.click(newSponsorTab)

    // Fill in new sponsor details
    const sponsorNameInput = screen.getByLabelText('Sponsor Name')
    await user.type(sponsorNameInput, 'New Test Sponsor')

    const companyNameInput = screen.getByLabelText(/company name/i)
    await user.type(companyNameInput, 'New Test Company')

    // Should be able to proceed
    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).not.toBeDisabled()
  })

  it('submits the form with all data', async () => {
    const user = userEvent.setup()
    const mockCreateDeal = createDeal as jest.MockedFunction<typeof createDeal>
    mockCreateDeal.mockResolvedValueOnce({ success: true, dealId: '123' })
    
    render(
      <CreateDealDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    // Step 1: Select sponsor
    const sponsorSelect = screen.getByRole('combobox', { name: /select sponsor/i })
    await user.click(sponsorSelect)
    await user.click(screen.getByText('Test Sponsor 1'))
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Step 2: Fill deal details
    await user.type(screen.getByLabelText('Deal Title'), 'Test Deal')
    
    const dealValueInput = screen.getByLabelText('Deal Value')
    await user.clear(dealValueInput)
    await user.type(dealValueInput, '5000')

    // Select deal type
    const dealTypeSelect = screen.getByRole('combobox', { name: /deal type/i })
    await user.click(dealTypeSelect)
    await user.click(screen.getByText('Dedicated Video'))

    await user.click(screen.getByRole('button', { name: /next/i }))

    // Step 3: Timeline (skip)
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Step 4: Content (skip)
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Step 5: Submit
    const submitButton = screen.getByRole('button', { name: /create deal/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateDeal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Deal',
          sponsorId: '1',
          dealValue: 5000,
          dealType: 'DEDICATED_VIDEO',
        })
      )
    })

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    const mockCreateDeal = createDeal as jest.MockedFunction<typeof createDeal>
    mockCreateDeal.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(
      <CreateDealDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    // Quick navigation to submit
    const sponsorSelect = screen.getByRole('combobox', { name: /select sponsor/i })
    await user.click(sponsorSelect)
    await user.click(screen.getByText('Test Sponsor 1'))

    // Navigate to last step
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: /next/i }))
    }

    const submitButton = screen.getByRole('button', { name: /create deal/i })
    await user.click(submitButton)

    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  it('handles errors during submission', async () => {
    const user = userEvent.setup()
    const mockCreateDeal = createDeal as jest.MockedFunction<typeof createDeal>
    mockCreateDeal.mockResolvedValueOnce({
      success: false,
      error: 'Failed to create deal',
    })
    
    render(
      <CreateDealDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    // Quick navigation to submit
    const sponsorSelect = screen.getByRole('combobox', { name: /select sponsor/i })
    await user.click(sponsorSelect)
    await user.click(screen.getByText('Test Sponsor 1'))

    // Navigate to last step
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: /next/i }))
    }

    const submitButton = screen.getByRole('button', { name: /create deal/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to create deal')).toBeInTheDocument()
    })
  })

  it('allows navigation between steps', async () => {
    const user = userEvent.setup()
    
    render(
      <CreateDealDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    // Select sponsor and go to step 2
    const sponsorSelect = screen.getByRole('combobox', { name: /select sponsor/i })
    await user.click(sponsorSelect)
    await user.click(screen.getByText('Test Sponsor 1'))
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Should be on step 2
    expect(screen.getByLabelText('Deal Title')).toBeInTheDocument()

    // Go back to step 1
    const prevButton = screen.getByRole('button', { name: /previous/i })
    await user.click(prevButton)

    // Should be back on step 1
    expect(screen.getByText('Select Sponsor')).toBeInTheDocument()
  })

  it('persists data when navigating between steps', async () => {
    const user = userEvent.setup()
    
    render(
      <CreateDealDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    )

    // Select sponsor
    const sponsorSelect = screen.getByRole('combobox', { name: /select sponsor/i })
    await user.click(sponsorSelect)
    await user.click(screen.getByText('Test Sponsor 1'))
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Fill in deal title
    await user.type(screen.getByLabelText('Deal Title'), 'My Test Deal')
    
    // Go back
    await user.click(screen.getByRole('button', { name: /previous/i }))
    
    // Go forward again
    await user.click(screen.getByRole('button', { name: /next/i }))
    
    // Title should still be there
    expect(screen.getByDisplayValue('My Test Deal')).toBeInTheDocument()
  })
})
