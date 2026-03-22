import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import ApplicationFormButton from '@/components/ui/application-form-button'

expect.extend(toHaveNoViolations)

describe('ApplicationFormButton', () => {
  it('renders the button with default text', () => {
    render(<ApplicationFormButton />)
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
  })

  it('renders the button with custom text', () => {
    render(<ApplicationFormButton text="Join Now" />)
    expect(screen.getByRole('button', { name: 'Join Now' })).toBeInTheDocument()
  })

  it('does not show modal initially', () => {
    render(<ApplicationFormButton />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens modal when button is clicked', () => {
    render(<ApplicationFormButton />)
    const button = screen.getByRole('button', { name: /apply/i })
    fireEvent.click(button)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes modal when close button is clicked', () => {
    render(<ApplicationFormButton />)
    fireEvent.click(screen.getByRole('button', { name: /apply/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Close application form'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes modal on Escape key', () => {
    render(<ApplicationFormButton />)
    fireEvent.click(screen.getByRole('button', { name: /apply/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders iframe in modal with correct sandbox attributes', () => {
    render(<ApplicationFormButton />)
    fireEvent.click(screen.getByRole('button', { name: /apply/i }))
    const iframe = screen.getByTitle('Charity Application Form')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute(
      'sandbox',
      'allow-scripts allow-forms allow-popups allow-same-origin'
    )
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(<ApplicationFormButton />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations when open', async () => {
    const { container } = render(<ApplicationFormButton />)
    fireEvent.click(screen.getByRole('button', { name: /apply/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
