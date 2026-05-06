import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import AccordionItem from '../../../src/components/ui/orange-faq-item'

expect.extend(toHaveNoViolations)

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage(props: { src: string; alt: string; width: number; height: number }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} width={props.width} height={props.height} />
  }
})

// Mock assetPath
jest.mock('@/lib/assetPath', () => ({
  assetPath: (path: string) => path,
}))

describe('AccordionItem (orange-faq-item)', () => {
  it('renders the title', () => {
    render(
      <AccordionItem title="What is TABS?">
        <p>TABS is a survey research study.</p>
      </AccordionItem>
    )
    expect(screen.getByText('What is TABS?')).toBeInTheDocument()
  })

  it('renders children when expanded', () => {
    render(
      <AccordionItem title="Question">
        <p>Answer content</p>
      </AccordionItem>
    )
    expect(screen.getByText('Answer content')).toBeInTheDocument()
  })

  it('renders a button with aria-expanded="false" initially', () => {
    render(
      <AccordionItem title="Question">
        <p>Answer</p>
      </AccordionItem>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles aria-expanded to true when clicked', () => {
    render(
      <AccordionItem title="Question">
        <p>Answer</p>
      </AccordionItem>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggles aria-expanded back to false when clicked again', () => {
    render(
      <AccordionItem title="Question">
        <p>Answer</p>
      </AccordionItem>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows Plus image when collapsed', () => {
    render(
      <AccordionItem title="Question">
        <p>Answer</p>
      </AccordionItem>
    )
    expect(screen.getByAltText('Plus')).toBeInTheDocument()
    expect(screen.queryByAltText('Minus')).not.toBeInTheDocument()
  })

  it('shows Minus image when expanded', () => {
    render(
      <AccordionItem title="Question">
        <p>Answer</p>
      </AccordionItem>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByAltText('Minus')).toBeInTheDocument()
    expect(screen.queryByAltText('Plus')).not.toBeInTheDocument()
  })

  it('has no accessibility violations when collapsed', async () => {
    const { container } = render(
      <AccordionItem title="Accessible Question">
        <p>Accessible answer</p>
      </AccordionItem>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no accessibility violations when expanded', async () => {
    const { container } = render(
      <AccordionItem title="Accessible Question">
        <p>Accessible answer</p>
      </AccordionItem>
    )
    fireEvent.click(screen.getByRole('button'))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
