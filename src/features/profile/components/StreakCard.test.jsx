import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StreakCard from './StreakCard'

describe('StreakCard Component', () => {
  it('renders loading skeleton when isLoading is true', () => {
    const { container } = render(<StreakCard isLoading={true} />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('renders nothing when isError is true', () => {
    const { container } = render(<StreakCard isError={true} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a smaller skeleton when waiting on extended streak', () => {
    render(<StreakCard isSaturated={true} isLoadingExtended={true} data={[]} />)
    expect(screen.getByText('Weekly Streak')).toBeInTheDocument()
    expect(screen.queryByText('Start rating.')).not.toBeInTheDocument()
  })

  it('displays "Start rating." when there is no streak', () => {
    const mockData = [
      { weekStart: '2024-01-01', count: 0 },
      { weekStart: '2024-01-08', count: 0 }
    ]
    render(<StreakCard data={mockData} />)
    expect(screen.getByText('Start rating.')).toBeInTheDocument()
  })

  it('displays the correct fast streak number', () => {
    const mockData = [
      { weekStart: '2024-01-01', count: 1 },
      { weekStart: '2024-01-08', count: 5 },
      { weekStart: '2024-01-15', count: 0 }
    ]
    render(<StreakCard data={mockData} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('displays the extended streak when saturated and loaded', () => {
    const mockData = [
      { weekStart: '2024-01-01', count: 1 }, 
      { weekStart: '2024-01-08', count: 0 }
    ]
    render(
      <StreakCard 
        data={mockData} 
        isSaturated={true} 
        extendedStreak={10} 
      />
    )
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})