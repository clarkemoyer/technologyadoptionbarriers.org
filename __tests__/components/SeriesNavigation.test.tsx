import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import SeriesNavigation from '../../src/components/series-navigation'
import { technologyAdoptionModelsSeries } from '../../src/data/technology-adoption-models-series'

expect.extend(toHaveNoViolations)

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

const mockedUsePathname = jest.requireMock('next/navigation').usePathname as jest.Mock

describe('SeriesNavigation component', () => {
  it('should render series root, branches, and bibliography links', () => {
    mockedUsePathname.mockReturnValue(technologyAdoptionModelsSeries.root.slug)

    render(<SeriesNavigation />)

    expect(
      screen.getByRole('link', {
        name: new RegExp(technologyAdoptionModelsSeries.root.title, 'i'),
      })
    ).toBeInTheDocument()

    for (const branch of technologyAdoptionModelsSeries.branches) {
      expect(
        screen.getAllByRole('link', {
          name: new RegExp(branch.title, 'i'),
        }).length
      ).toBeGreaterThan(0)
    }

    expect(
      screen.getByRole('link', {
        name: new RegExp(technologyAdoptionModelsSeries.bibliography!.title, 'i'),
      })
    ).toBeInTheDocument()
  })

  it('should mark the current page with aria-current', () => {
    const currentArticle = technologyAdoptionModelsSeries.branches[0].articles[0]
    mockedUsePathname.mockReturnValue(currentArticle.slug)

    render(<SeriesNavigation />)

    const currentLinks = screen.getAllByRole('link', { name: currentArticle.title })
    expect(currentLinks.some((link) => link.getAttribute('aria-current') === 'page')).toBe(true)
  })

  it('should render coming-soon items as links (to allow flow testing)', () => {
    // Use a published page as the current route
    mockedUsePathname.mockReturnValue(technologyAdoptionModelsSeries.branches[0].articles[0].slug)

    render(<SeriesNavigation />)

    const comingSoon = technologyAdoptionModelsSeries.branches[0].articles[1]

    // Title should be present...
    expect(screen.getAllByText(comingSoon.title).length).toBeGreaterThan(0)

    // ...and now rendered as a link.
    const comingSoonLinks = screen.getAllByRole('link', {
      name: /Article 1\.2: The Game Changer/i,
    })
    expect(comingSoonLinks.length).toBeGreaterThan(0)
    expect(comingSoonLinks.some((link) => link.getAttribute('href') === comingSoon.slug)).toBe(true)

    // Coming soon label should still be visible.
    expect(screen.getAllByText(/Coming soon/i).length).toBeGreaterThan(0)
  })

  it('should not have accessibility violations', async () => {
    mockedUsePathname.mockReturnValue(technologyAdoptionModelsSeries.branches[0].articles[0].slug)

    const { container } = render(<SeriesNavigation />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
