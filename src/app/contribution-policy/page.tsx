import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contribution Policy | Technology Adoption Barriers (TABS)',
  description: 'Contribution Policy for the Technology Adoption Barriers (TABS) website',
}

export default function ContributionPolicy() {
  return (
    <main className="ffc-container py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-faustina)] text-[48px] leading-[60px] mb-8">
          Contribution Policy
        </h1>

        <div className="prose max-w-none font-[var(--font-lato)] text-[18px] leading-[28px]">
          <p>
            <strong>Effective Date:</strong> January 17, 2026
          </p>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Important Notice About Tax Deductibility
          </h2>
          <p>
            The Technology Adoption Barriers (TABS) project is <strong>not a 501(c)(3) organization</strong> or 
            a state-level nonprofit entity. Contributions made to TABS are <strong>not tax-deductible</strong> as 
            charitable donations. We do not offer any goods or services in exchange for contributions.
          </p>
          <p>
            TABS operates as a not-for-profit research activity. Any funds received are used solely to support 
            the research mission and operational costs of the project.
          </p>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Use of Contributions
          </h2>
          <p>
            Contributions support the Technology Adoption Barriers (TABS) research mission and help cover costs
            associated with operating and improving the project, including:
          </p>
          <ul>
            <li>Survey and research operations</li>
            <li>Website hosting and maintenance</li>
            <li>Content development and analysis</li>
            <li>Administrative costs necessary to operate the project</li>
          </ul>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Contribution Processing
          </h2>
          <p>
            Contributions are processed securely through our payment partners. You will receive a
            confirmation email after your contribution is processed.
          </p>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Refund Policy
          </h2>
          <p>
            We generally do not provide refunds for contributions. However, if you believe an error has
            occurred, please contact us within 30 days of your contribution.
          </p>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Privacy
          </h2>
          <p>
            Contributor information is kept confidential and will not be shared with third parties except
            as required by law.
          </p>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Contact Us
          </h2>
          <p>For questions about contributions or this policy, please contact us at:</p>
          <p>
            Email:{' '}
            <a
              href="mailto:contact@technologyadoptionbarriers.org"
              className="text-primary hover:underline"
            >
              contact@technologyadoptionbarriers.org
            </a>
            <br />
            Phone: (520) 222-8104
          </p>
        </div>
      </div>
    </main>
  )
}
