import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Donation Policy | Technology Adoption Barriers (TABS)',
  description: 'Donation Policy for the Technology Adoption Barriers (TABS) website',
}

export default function DonationPolicy() {
  return (
    <main className="ffc-container py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-faustina)] text-[48px] leading-[60px] mb-8">
          Donation Policy
        </h1>

        <div className="prose max-w-none font-[var(--font-lato)] text-[18px] leading-[28px]">
          <p>
            <strong>Effective Date:</strong> January 1, 2024
          </p>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Tax Deductibility
          </h2>
          <p>
            Donations made through the Technology Adoption Barriers (TABS) website may or may not be
            tax-deductible, depending on your circumstances and the way the donation is processed.
            Please consult your tax advisor for guidance.
          </p>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Use of Donations
          </h2>
          <p>
            Donations support the Technology Adoption Barriers (TABS) mission and help cover costs
            associated with operating and improving the site, including:
          </p>
          <ul>
            <li>Survey and research operations</li>
            <li>Website hosting and maintenance</li>
            <li>Content development and analysis</li>
            <li>Administrative costs necessary to operate the site</li>
          </ul>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Donation Processing
          </h2>
          <p>
            Donations are processed securely through our payment partners. You will receive a
            confirmation email after your donation is processed.
          </p>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Refund Policy
          </h2>
          <p>
            We generally do not provide refunds for donations. However, if you believe an error has
            occurred, please contact us within 30 days of your donation.
          </p>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Privacy
          </h2>
          <p>
            Donor information is kept confidential and will not be shared with third parties except
            as required by law.
          </p>

          <h2 className="font-[var(--font-faustina)] text-[32px] leading-[40px] mt-8 mb-4">
            Contact Us
          </h2>
          <p>For questions about donations or this policy, please contact us at:</p>
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
