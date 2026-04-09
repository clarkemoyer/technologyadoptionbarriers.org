import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import PrevNextCards from '../../src/components/prev-next-cards'

expect.extend(toHaveNoViolations)

describe('PrevNextCards', () => {
  it('renders nothing when both prev and next are null', () => {
    const { container } = render(<PrevNextCards />)
    expect(container.querySelector('nav')).not.toBeInTheDocument()
  })

  it('renders previous card when prev is provided', () => {
    render(<PrevNextCards prev={{ title: 'Previous Page', href: '/previous' }} />)
    expect(screen.getByText('Previous Page')).toBeInTheDocument()
    expect(screen.getByText('← Previous')).toBeInTheDocument()
  })

  it('renders next card when next is provided', () => {
    render(<PrevNextCards next={{ title: 'Next Page', href: '/next' }} />)
    expect(screen.getByText('Next Page')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('renders both cards when both are provided', () => {
    render(
      <PrevNextCards
        prev={{ title: 'Prev', href: '/prev' }}
        next={{ title: 'Next', href: '/next' }}
      />
    )
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('links point to correct hrefs', () => {
    render(
      <PrevNextCards
        prev={{ title: 'Prev', href: '/prev' }}
        next={{ title: 'Next', href: '/next' }}
      />
    )
    expect(screen.getByRole('link', { name: /prev/i })).toHaveAttribute('href', '/prev')
    expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute('href', '/next')
  })

  it('has navigation aria-label', () => {
    render(<PrevNextCards next={{ title: 'Next', href: '/next' }} />)
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Previous and next pages')
  })

  it('passes accessibility checks', async () => {
    const { container } = render(
      <PrevNextCards
        prev={{ title: 'Prev', href: '/prev' }}
        next={{ title: 'Next', href: '/next' }}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
