export type Faq = { question: string; answer: string }

// Import TABS-specific FAQs
import faq1 from './faqs/what-is-tabs.json'
import faq2 from './faqs/why-tabs-matters.json'
import faq3 from './faqs/common-barriers.json'
import faq4 from './faqs/how-to-participate.json'

export const faqs: Faq[] = [faq1, faq2, faq3, faq4]
