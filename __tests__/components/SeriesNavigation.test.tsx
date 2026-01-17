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
        screen.getByRole('link', {
          name: new RegExp(branch.title, 'i'),
        })
      ).toBeInTheDocument()
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

    const currentLink = screen.getByRole('link', { name: currentArticle.title })
    expect(currentLink).toHaveAttribute('aria-current', 'page')
  })

  it('should render coming-soon items as non-clickable text', () => {
    // Use a published page as the current route
    mockedUsePathname.mockReturnValue(technologyAdoptionModelsSeries.branches[0].articles[0].slug)

    render(<SeriesNavigation />)

    const comingSoon = technologyAdoptionModelsSeries.branches[0].articles[1]

    // Title should be present...
    expect(screen.getAllByText(comingSoon.title).length).toBeGreaterThan(0)

    // ...but not rendered as a link.
    expect(screen.queryByRole('link', { name: comingSoon.title })).not.toBeInTheDocument()
  })

  it('should not have accessibility violations', async () => {
    mockedUsePathname.mockReturnValue(technologyAdoptionModelsSeries.branches[0].articles[0].slug)

    const { container } = render(<SeriesNavigation />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
