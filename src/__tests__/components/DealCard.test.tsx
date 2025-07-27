import { render, screen, fireEvent, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { DealCard } from '@/components/board/DealCard'
import { createMockDealWithRelations } from '@/test/factories'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('DealCard', () => {
  const mockDeal = createMockDealWithRelations({
    title: 'Test Deal',
    sponsor: {
      name: 'Test Sponsor',
      companyName: 'Test Company',
    },
    dealValue: 5000,
    priority: 'HIGH',
    contentDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    tags: [
      { id: '1', name: 'Tech', color: '#3b82f6' },
      { id: '2', name: 'Video', color: '#22c55e' },
    ],
  })

  it('renders deal information correctly', () => {
    render(<DealCard deal={mockDeal} />)

    expect(screen.getByText('Test Deal')).toBeInTheDocument()
    expect(screen.getByText('Test Sponsor')).toBeInTheDocument()
    expect(screen.getByText('$5,000')).toBeInTheDocument()
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText(/Due in \d+ days/)).toBeInTheDocument()
  })

  it('shows correct priority styling', () => {
    const { rerender } = render(<DealCard deal={mockDeal} />)
    
    let priorityBadge = screen.getByText('HIGH')
    expect(priorityBadge).toHaveClass('bg-orange-100', 'text-orange-600')

    rerender(<DealCard deal={{ ...mockDeal, priority: 'URGENT' }} />)
    priorityBadge = screen.getByText('URGENT')
    expect(priorityBadge).toHaveClass('bg-red-100', 'text-red-600')
  })

  it('displays tags correctly', () => {
    render(<DealCard deal={mockDeal} />)

    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('shows overdue indicator when content is overdue', () => {
    const overdueDeal = createMockDealWithRelations({
      ...mockDeal,
      contentDueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    })

    render(<DealCard deal={overdueDeal} />)
    
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toHaveClass('text-destructive')
  })

  it('opens dropdown menu on click', async () => {
    const user = userEvent.setup()
    render(<DealCard deal={mockDeal} />)

    const menuButton = screen.getByRole('button', { name: /more options/i })
    await user.click(menuButton)

    expect(screen.getByText('View details')).toBeInTheDocument()
    expect(screen.getByText('Edit deal')).toBeInTheDocument()
    expect(screen.getByText('Archive')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('displays comment and attachment counts', () => {
    const dealWithActivity = createMockDealWithRelations({
      ...mockDeal,
      commentCount: 5,
      attachmentCount: 3,
    })

    render(<DealCard deal={dealWithActivity} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows assigned user avatar', () => {
    const dealWithAssignee = createMockDealWithRelations({
      ...mockDeal,
      assignedTo: {
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      },
    })

    render(<DealCard deal={dealWithAssignee} />)
    
    const avatar = screen.getByRole('img', { name: /john doe/i })
    expect(avatar).toHaveAttribute('src', expect.stringContaining('avatar.jpg'))
  })

  it('applies drag styles when dragging', () => {
    render(<DealCard deal={mockDeal} isDragging />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveClass('opacity-50')
  })

  it('handles long titles gracefully', () => {
    const longTitleDeal = createMockDealWithRelations({
      ...mockDeal,
      title: 'This is a very long deal title that should be truncated to prevent overflow in the card layout',
    })

    render(<DealCard deal={longTitleDeal} />)
    
    const title = screen.getByText(/This is a very long deal title/i)
    expect(title).toHaveClass('truncate')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<DealCard deal={mockDeal} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('shows stage duration correctly', () => {
    const dealWithStageDuration = createMockDealWithRelations({
      ...mockDeal,
      stageUpdatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    })

    render(<DealCard deal={dealWithStageDuration} />)
    
    expect(screen.getByText(/In stage for 3 days/i)).toBeInTheDocument()
  })

  it('handles missing optional data gracefully', () => {
    const minimalDeal = createMockDealWithRelations({
      title: 'Minimal Deal',
      sponsor: { name: 'Sponsor' },
      dealValue: 1000,
      priority: 'LOW',
      contentDueDate: null,
      tags: [],
      assignedTo: null,
    })

    render(<DealCard deal={minimalDeal} />)
    
    expect(screen.getByText('Minimal Deal')).toBeInTheDocument()
    expect(screen.queryByText(/Due in/)).not.toBeInTheDocument()
  })
})
