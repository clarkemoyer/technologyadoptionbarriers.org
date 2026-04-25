import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import ImageLightbox from '../../../src/components/ui/image-lightbox'

expect.extend(toHaveNoViolations)

const defaultProps = {
  src: '/images/test-diagram.png',
  alt: 'Test Diagram',
  width: 800,
  height: 600,
}

describe('ImageLightbox', () => {
  it('renders inline thumbnail with correct alt text', () => {
    render(<ImageLightbox {...defaultProps} />)
    const img = screen.getByAltText('Test Diagram')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/images/test-diagram.png')
  })

  it('thumbnail has loading="lazy" and decoding="async"', () => {
    render(<ImageLightbox {...defaultProps} />)
    const img = screen.getByAltText('Test Diagram')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
  })

  it('opens lightbox on click', () => {
    render(<ImageLightbox {...defaultProps} />)
    const trigger = screen.getByRole('button', { name: /expand image/i })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('dialog has aria-modal and aria-labelledby', () => {
    render(<ImageLightbox {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /expand image/i }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')

    // Verify the sr-only heading exists and matches
    const labelId = dialog.getAttribute('aria-labelledby')!
    const heading = document.getElementById(labelId)
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Full-screen image view')
  })

  it('has a close button with accessible name', () => {
    render(<ImageLightbox {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /expand image/i }))
    expect(screen.getByRole('button', { name: /close full-screen view/i })).toBeInTheDocument()
  })

  it('closes on close button click', () => {
    render(<ImageLightbox {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /expand image/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /close full-screen view/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on Escape key', () => {
    render(<ImageLightbox {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /expand image/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on backdrop click', () => {
    render(<ImageLightbox {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /expand image/i }))

    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not close when clicking inside the modal content', () => {
    render(<ImageLightbox {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /expand image/i }))

    // The full-screen image inside the modal - click it
    const images = screen.getAllByAltText('Test Diagram')
    const lightboxImg = images[images.length - 1] // The one inside the dialog
    fireEvent.click(lightboxImg)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('locks body scroll when open and restores on close', () => {
    render(<ImageLightbox {...defaultProps} />)
    expect(document.body.style.overflow).not.toBe('hidden')

    fireEvent.click(screen.getByRole('button', { name: /expand image/i }))
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.click(screen.getByRole('button', { name: /close full-screen view/i }))
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(<ImageLightbox {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations when open', async () => {
    const { container } = render(<ImageLightbox {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /expand image/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
