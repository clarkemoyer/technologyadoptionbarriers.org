import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import TeamMemberCard from '../../../src/components/ui/team-member-card'

expect.extend(toHaveNoViolations)

describe('TeamMemberCard', () => {
  const defaultProps = {
    imageUrl: '/Images/team/member.jpg',
    name: 'Jane Doe',
    title: 'Research Director',
    linkedinUrl: 'https://linkedin.com/in/janedoe',
  }

  it('renders name and title', () => {
    render(<TeamMemberCard {...defaultProps} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Research Director')).toBeInTheDocument()
  })

  it('renders profile image with name as alt text', () => {
    render(<TeamMemberCard {...defaultProps} />)
    const img = screen.getByAltText('Jane Doe')
    expect(img).toBeInTheDocument()
  })

  it('renders LinkedIn link pointing to correct URL', () => {
    render(<TeamMemberCard {...defaultProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/janedoe')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<TeamMemberCard {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
