import type { Metadata } from 'next'
import { ARTICLE_CLASSES, H1_CLASSES, H2_CLASSES, H3_CLASSES } from '@/lib/articleStyles'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Accessibility & Inclusive Design - Making of TABS',
  description:
    'How the TABS project approaches web accessibility - automated testing with jest-axe, WCAG AA compliance, keyboard navigation, and the accessibility-first review process.',
  alternates: {
    canonical: '/making-of-tabs/accessibility',
  },
}

const AccessibilityPage = () => {
  return (
    <div className="pt-20 sm:pt-[120px] bg-white">
      <article className={ARTICLE_CLASSES}>
        <h1 className={H1_CLASSES}>Accessibility &amp; Inclusive Design</h1>

        <section className="mb-10 text-gray-800">
          <p className="mb-6">
            A research project about technology adoption barriers has a particular obligation to be
            accessible to everyone. If someone cannot use our website because of a disability, we
            have failed at the most basic level. Accessibility is not a feature we add at the end -
            it is tested automatically in every pull request and enforced in code review.
          </p>
        </section>

        {/* ── Our Standard ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Our Standard: WCAG AA</h2>
          <p className="mb-6">
            We target{' '}
            <a
              href="https://www.w3.org/WAI/WCAG21/quickref/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              WCAG 2.1 Level AA
            </a>{' '}
            compliance across all pages. This means:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Color contrast</strong> - text meets minimum contrast ratios against
              backgrounds (4.5:1 for normal text, 3:1 for large text)
            </li>
            <li>
              <strong>Keyboard navigation</strong> - every interactive element is reachable and
              operable using only a keyboard
            </li>
            <li>
              <strong>Screen reader support</strong> - content is structured with semantic HTML and
              appropriate ARIA attributes
            </li>
            <li>
              <strong>Text alternatives</strong> - all images have descriptive alt text; all icons
              have accessible labels
            </li>
            <li>
              <strong>Focus indicators</strong> - visible focus outlines on all interactive elements
              using <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">focus-visible</code>{' '}
              styles
            </li>
          </ul>
        </section>

        {/* ── Automated Testing ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Automated Testing with jest-axe</h2>
          <p className="mb-6">
            Key components have unit tests that include accessibility checks using{' '}
            <a
              href="https://github.com/nickcolley/jest-axe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              jest-axe
            </a>
            , which runs the{' '}
            <a
              href="https://github.com/dequelabs/axe-core"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              axe-core
            </a>{' '}
            accessibility engine against rendered components:
          </p>

          <div className="mb-6 rounded-lg bg-gray-900 text-gray-100 p-4 overflow-x-auto">
            <pre className="text-sm font-mono">
              <code>{`// Every component test includes this pattern:
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})`}</code>
            </pre>
          </div>

          <p className="mb-6">
            This runs in CI on every pull request. If a component introduces an accessibility
            violation - a missing ARIA label, an incorrect role, a form input without a label - the
            test fails and the PR cannot be merged.
          </p>

          <h3 className={H3_CLASSES}>What jest-axe Catches</h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Missing or empty alt text on images</li>
            <li>Buttons and links without accessible names</li>
            <li>Form inputs without associated labels</li>
            <li>Incorrect ARIA roles and attributes</li>
            <li>Color contrast violations</li>
            <li>Missing document language</li>
            <li>Duplicate IDs</li>
            <li>Heading hierarchy issues</li>
          </ul>
        </section>

        {/* ── Real Examples ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Real Fixes from Code Review</h2>
          <p className="mb-6">
            Automated Copilot code review regularly catches accessibility issues that tests miss.
            Here are real examples from our review history:
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg border-l-4 border-orange-400 bg-orange-50">
              <p className="font-bold text-gray-900 mb-1">Icon-only buttons missing labels</p>
              <p className="text-sm text-gray-700">
                A mobile menu hamburger button had an SVG icon but no{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">aria-label</code>. Screen
                readers announced it as simply &quot;button.&quot; Fix: added{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                  aria-label=&quot;Open menu&quot;
                </code>
                .
              </p>
            </div>

            <div className="p-4 rounded-lg border-l-4 border-orange-400 bg-orange-50">
              <p className="font-bold text-gray-900 mb-1">
                Breadcrumb navigation missing semantics
              </p>
              <p className="text-sm text-gray-700">
                Breadcrumbs were using plain{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">&lt;span&gt;</code> and{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">&lt;a&gt;</code> elements.
                Fix: wrapped in{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                  &lt;nav aria-label=&quot;Breadcrumb&quot;&gt;
                </code>{' '}
                with <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">&lt;ol&gt;</code>{' '}
                structure and{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                  aria-current=&quot;page&quot;
                </code>{' '}
                on the current item.
              </p>
            </div>

            <div className="p-4 rounded-lg border-l-4 border-orange-400 bg-orange-50">
              <p className="font-bold text-gray-900 mb-1">
                Decorative separator exposed to screen readers
              </p>
              <p className="text-sm text-gray-700">
                Breadcrumb separators (
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">›</code>) were being
                announced. Fix: added{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                  aria-hidden=&quot;true&quot;
                </code>{' '}
                to separator spans.
              </p>
            </div>

            <div className="p-4 rounded-lg border-l-4 border-orange-400 bg-orange-50">
              <p className="font-bold text-gray-900 mb-1">Video without captions</p>
              <p className="text-sm text-gray-700">
                The TABS introductory video was added without a captions track. Fix: added a{' '}
                <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                  &lt;track kind=&quot;captions&quot;&gt;
                </code>{' '}
                element with the English VTT file, set as default.
              </p>
            </div>
          </div>
        </section>

        {/* ── Semantic HTML ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Semantic HTML First</h2>
          <p className="mb-6">
            We prioritize semantic HTML over ARIA workarounds. The principle is simple: if there is
            a native HTML element that does what you need, use it instead of adding ARIA attributes
            to a generic element.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold border-b border-gray-200">
                    Instead of
                  </th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">We use</th>
                  <th className="text-left p-3 font-semibold border-b border-gray-200">Why</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3">
                    <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                      &lt;div onClick&gt;
                    </code>
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">&lt;button&gt;</code>
                  </td>
                  <td className="p-3">
                    Built-in keyboard support, focus, and screen reader announcement
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3">
                    <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                      &lt;div role=&quot;navigation&quot;&gt;
                    </code>
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">&lt;nav&gt;</code>
                  </td>
                  <td className="p-3">Native landmark, no ARIA needed</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3">
                    <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                      &lt;div class=&quot;header&quot;&gt;
                    </code>
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">&lt;header&gt;</code>
                  </td>
                  <td className="p-3">Automatic landmark region</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3">
                    <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                      &lt;span class=&quot;link&quot;&gt;
                    </code>
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">&lt;a href&gt;</code>
                  </td>
                  <td className="p-3">Native link behavior, right-click menu, browser history</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Keyboard Navigation ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Keyboard Navigation</h2>
          <p className="mb-6">
            The entire site is navigable using only a keyboard. Key patterns we ensure:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Tab order</strong> follows visual reading order (left-to-right, top-to-bottom)
            </li>
            <li>
              <strong>Focus trapping</strong> in modal dialogs - Tab cycles within the dialog until
              it is closed
            </li>
            <li>
              <strong>Escape key</strong> closes dialogs, menus, and overlays
            </li>
            <li>
              <strong>Skip-to-content</strong> link available for screen reader users to bypass
              navigation
            </li>
            <li>
              <strong>Visible focus indicators</strong> - all interactive elements show a clear blue
              ring when focused via keyboard (using Tailwind&apos;s{' '}
              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">focus-visible</code>{' '}
              utilities)
            </li>
          </ul>
        </section>

        {/* ── Ongoing Commitment ── */}
        <section className="mb-12 text-gray-800">
          <h2 className={H2_CLASSES}>Ongoing Commitment</h2>
          <p className="mb-6">
            Accessibility is never &quot;done.&quot; We continually improve through:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>PR accessibility checklist</strong> - every pull request template includes an
              accessibility section that reviewers must check
            </li>
            <li>
              <strong>Copilot review</strong> - automated reviews specifically flag ARIA and
              accessibility issues
            </li>
            <li>
              <strong>Lighthouse CI</strong> - accessibility scoring on every merge to main
            </li>
            <li>
              <strong>Manual testing</strong> - periodic keyboard-only and screen reader testing of
              critical paths
            </li>
          </ul>

          <p>
            If you encounter an accessibility issue on this site, please{' '}
            <a
              href="mailto:contact@technologyadoptionbarriers.org"
              className="text-blue-600 underline hover:text-blue-800"
            >
              let us know
            </a>
            . We take every report seriously.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            Accessibility is a core value, not a compliance checkbox.
          </p>
        </section>
      </article>
    </div>
  )
}

export default AccessibilityPage
