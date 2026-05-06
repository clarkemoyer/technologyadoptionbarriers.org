import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import AddressCard from '../../../src/components/ui/contact-data-card'

expect.extend(toHaveNoViolations)

const defaultProps = {
  imageSrc: '/icons/location-pin.svg',
  heading: 'Main Address',
  description: '4030 Wake Forest Road\nRaleigh, NC 27609',
}

describe('AddressCard', () => {
  it('renders the heading', () => {
    render(<AddressCard {...defaultProps} />)
    expect(screen.getByText('Main Address')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<AddressCard {...defaultProps} />)
    expect(screen.getByText(/4030 Wake Forest Road/)).toBeInTheDocument()
  })

  it('renders an image with alt text "Location pin"', () => {
    render(<AddressCard {...defaultProps} />)
    const img = screen.getByAltText('Location pin')
    expect(img).toBeInTheDocument()
  })

  it('renders a heading element for the heading prop', () => {
    render(<AddressCard {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Main Address' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<AddressCard {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
