/**
 * Comprehensive FAQ data for the dedicated FAQ page.
 *
 * Categories span the full scope of the TABS project:
 *   1. About TABS
 *   2. The Survey
 *   3. Technology Adoption Barriers
 *   4. Research & Methodology
 *   5. For Organizations
 *   6. Getting Involved
 *   7. Privacy, Data & Ethics
 *   8. Teaching & Educational Resources
 */

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface FaqCategory {
  id: string
  title: string
  description: string
  icon: string
  items: FaqItem[]
}

export const faqCategories: FaqCategory[] = [
  {
    id: 'about-tabs',
    title: 'About TABS',
    description:
      'Learn what the Technology Adoption Barriers Survey is, who runs it, and what it aims to achieve.',
    icon: '📖',
    items: [
      {
        id: 'what-is-tabs',
        question: 'What is the Technology Adoption Barriers Survey (TABS)?',
        answer:
          'TABS is a research initiative that collects insights from organizational leaders to identify and overcome obstacles to technology adoption. The project aims to share findings annually to benefit the broader community.',
      },
      {
        id: 'who-runs-tabs',
        question: 'Who is behind the TABS project?',
        answer:
          'TABS is a research project by Clarke Moyer, conducted as part of the Penn State Smeal College of Business DBA Program. The project focuses on documenting and addressing the challenges organizations face when adopting new technology.',
      },
      {
        id: 'why-tabs-exists',
        question: 'Why was TABS created?',
        answer:
          'Technology adoption failures lead to significant losses for organizations, yet the specific barriers driving those failures are often poorly understood. TABS was created to fill that knowledge gap with rigorous, openly shared research.',
      },
      {
        id: 'tabs-goals',
        question: 'What are the long-term goals of the TABS project?',
        answer:
          'TABS aims to build a multi-year longitudinal dataset that tracks how technology adoption barriers evolve over time. This data helps practitioners, educators, and policymakers make evidence-based decisions about technology strategy.',
      },
      {
        id: 'tabs-university',
        question: 'Is TABS affiliated with a university?',
        answer:
          'Yes. TABS is a research project conducted as part of the Penn State Smeal College of Business DBA Program. The survey has received IRB approval from Penn State University. The project source code, data methodology, and all research materials are publicly available on GitHub.',
      },
      {
        id: 'tabs-funding',
        question: 'How is TABS funded?',
        answer:
          'TABS is funded through financial contributions via GitHub Sponsors and volunteer effort. All funding goes directly toward research, survey distribution, and making results publicly available.',
      },
    ],
  },
  {
    id: 'the-survey',
    title: 'The Survey',
    description:
      'Everything about taking the survey - who should participate, how long it takes, and what happens with your responses.',
    icon: '📋',
    items: [
      {
        id: 'who-should-take',
        question: 'Who should take the TABS survey?',
        answer:
          'Anyone involved in technology decisions within an organization - IT leaders, department heads, project managers, end users, consultants, educators, and executives. The more diverse the respondents, the richer the insights.',
      },
      {
        id: 'how-long-survey',
        question: 'How long does the survey take?',
        answer:
          'The survey typically takes 20–25 minutes to complete. It is designed to be thorough enough to produce meaningful data while respecting your time.',
      },
      {
        id: 'what-questions',
        question: 'What kinds of questions does the survey ask?',
        answer:
          'The survey covers topics such as which technologies your organization has adopted, what barriers were encountered during adoption, how those barriers were addressed, and what factors contributed to successful adoption.',
      },
      {
        id: 'take-survey-multiple-times',
        question: 'Can I take the survey more than once?',
        answer:
          'Each annual cycle is a separate survey, so you are welcome to participate each year. Within a single cycle, one complete response per person is preferred to maintain data integrity.',
      },
      {
        id: 'survey-anonymous',
        question: 'Is the survey anonymous?',
        answer:
          'Yes. The survey does not collect your name or email address. Responses are analyzed in aggregate, and no individual can be identified from the published results. Participants recruited through the Prolific research platform have a pseudonymous study ID recorded for quality assurance; this identifier cannot be used to identify you without Prolific\u2019s own records.',
      },
      {
        id: 'survey-platform',
        question: 'What platform is the survey hosted on?',
        answer:
          'The survey is hosted on Qualtrics, a leading enterprise survey platform used by universities and research institutions worldwide. Qualtrics provides industry-standard security and data protection.',
      },
    ],
  },
  {
    id: 'barriers',
    title: 'Technology Adoption Barriers',
    description: 'Understand the common barriers organizations face and how TABS categorizes them.',
    icon: '🚧',
    items: [
      {
        id: 'common-barriers',
        question: 'What are the most common technology adoption barriers?',
        answer:
          'Based on existing technology adoption research, the most frequently reported barriers include cost and financial constraints, lack of awareness of available solutions, resistance to change, technology complexity, compatibility and integration challenges, infrastructure limitations, skill gaps, and security or compliance concerns. TABS aims to validate and expand on these findings through its own data collection.',
      },
      {
        id: 'barriers-vary',
        question: 'Do barriers vary by organization size or industry?',
        answer:
          'Research suggests that they do. Small organizations often cite cost and skill gaps as primary barriers, while larger enterprises more often struggle with integration complexity and change management. Industry-specific regulations can also create unique adoption challenges. TABS collects data across organization sizes and sectors to explore these patterns.',
      },
      {
        id: 'overcome-barriers',
        question: 'How can organizations overcome adoption barriers?',
        answer:
          'Based on adoption research, effective strategies include executive sponsorship and clear communication, phased rollouts with pilot programs, investment in training and change management, selecting technologies that integrate well with existing systems, and building a culture that embraces innovation.',
      },
      {
        id: 'top-barrier',
        question: 'What is the most commonly reported technology adoption barrier?',
        answer:
          'Existing technology adoption literature frequently cites cost as a leading barrier. Cost encompasses not just the purchase price of technology, but also implementation, training, maintenance, and the opportunity cost of transitioning from existing systems. TABS aims to validate this through its own data collection and track how cost barriers evolve over time.',
      },
    ],
  },
  {
    id: 'research',
    title: 'Research & Methodology',
    description: 'How the TABS research is designed, conducted, and validated.',
    icon: '🔬',
    items: [
      {
        id: 'research-methodology',
        question: 'What research methodology does TABS use?',
        answer:
          'TABS uses a quantitative survey methodology informed by established technology adoption frameworks such as the Technology Acceptance Model (TAM), Unified Theory of Acceptance and Use of Technology (UTAUT), and the Diffusion of Innovations theory.',
      },
      {
        id: 'academic-frameworks',
        question: 'What academic frameworks inform the TABS survey design?',
        answer:
          'The survey design is informed by TAM, TAM2, TAM3, UTAUT, UTAUT2, Diffusion of Innovations (DOI), and the Technology-Organization-Environment (TOE) framework. These well-validated models inform the survey\u2019s exploration of technology adoption factors.',
      },
      {
        id: 'data-published',
        question: 'Are TABS results published publicly?',
        answer:
          'As data is collected, aggregate findings and trend analyses are published on the TABS website and made available for academic, educational, and organizational use. Individual responses are never published.',
      },
      {
        id: 'use-data-research',
        question: 'Can I use TABS data in my own research?',
        answer:
          'Absolutely. TABS encourages researchers, students, and educators to reference the published findings. Proper citation information is available on the website. For access to anonymized datasets, contact the TABS research team.',
      },
      {
        id: 'longitudinal',
        question: 'Is TABS a one-time study or an ongoing effort?',
        answer:
          'TABS is designed as a longitudinal study conducted annually. Repeating the survey each year allows researchers to track how adoption barriers evolve over time in response to market shifts, emerging technologies, and changing organizational practices.',
      },
      {
        id: 'sample-size',
        question: 'How large is the TABS sample?',
        answer:
          'Sample size varies by cycle. TABS recruits participants through multiple channels including the website, academic partnerships, professional networks, and the Prolific research platform to ensure a diverse and statistically meaningful sample.',
      },
    ],
  },
  {
    id: 'for-organizations',
    title: 'For Organizations',
    description: 'How organizations can use TABS insights to improve their technology strategy.',
    icon: '🏢',
    items: [
      {
        id: 'org-benefit',
        question: 'How can my organization benefit from TABS?',
        answer:
          'As TABS collects more data, published findings will enable benchmarking that helps you understand how your technology adoption challenges compare to peers. You can use the findings to prioritize investments, build a business case for change management, and avoid common pitfalls.',
      },
      {
        id: 'org-specific-roles',
        question: 'Are there resources for specific leadership roles?',
        answer:
          'Yes. TABS provides tailored resources for executive leaders, finance leaders, operations leaders, and technology leaders. Each set of resources addresses the adoption barriers most relevant to that role.',
      },
      {
        id: 'benchmark',
        question: 'Can we benchmark our organization against TABS data?',
        answer:
          'As TABS publishes more aggregate data, you will be able to compare the barriers your organization faces with the most commonly reported barriers across all respondents. For more detailed analysis, consider contacting the TABS team about partnership opportunities.',
      },
      {
        id: 'org-size',
        question: 'Is TABS relevant for small organizations?',
        answer:
          'Yes. Technology adoption barriers affect organizations of all sizes. Small and mid-sized organizations often face unique challenges around budget, staffing, and vendor selection that TABS data can help illuminate.',
      },
      {
        id: 'internal-assessment',
        question: 'Can we use TABS to run an internal assessment?',
        answer:
          'The Technology Lifecycle Assessment Template, available in the Teaching Series, provides a framework for organizations to assess their own adoption readiness. It complements the survey data with actionable self-evaluation tools.',
      },
    ],
  },
  {
    id: 'getting-involved',
    title: 'Getting Involved',
    description:
      'Ways to support the TABS mission - from taking the survey to volunteering or contributing.',
    icon: '🤝',
    items: [
      {
        id: 'how-participate',
        question: 'How can I participate in TABS research?',
        answer:
          'The primary way to participate is by taking the TABS survey. You can also contribute by sharing the survey with colleagues, volunteering to help with research or outreach, or contributing financially through GitHub Sponsors.',
      },
      {
        id: 'volunteer',
        question: 'How can I volunteer with TABS?',
        answer:
          'TABS welcomes volunteers in areas such as research assistance, data analysis, content creation, outreach, and technical development. Visit the Get Involved page or contact the team to learn about current opportunities.',
      },
      {
        id: 'contribute',
        question: 'How do contributions support TABS?',
        answer:
          'Financial contributions through GitHub Sponsors fund survey distribution, participant recruitment, data analysis, website hosting, and making research findings freely available. Contributions are not tax-deductible.',
      },
      {
        id: 'share-survey',
        question: 'Can I share the survey with my professional network?',
        answer:
          'Please do! Wider distribution leads to more diverse and representative data. Share the survey link with colleagues, industry groups, professional associations, or on social media.',
      },
      {
        id: 'academic-partnership',
        question: 'Can our university or institution partner with TABS?',
        answer:
          'Yes. TABS actively seeks academic partnerships for survey distribution, joint research, course integration, and conference collaboration. Contact the team at contact@technologyadoptionbarriers.org to discuss partnership opportunities.',
      },
    ],
  },
  {
    id: 'privacy-data',
    title: 'Privacy, Data & Ethics',
    description: 'How your data is protected, stored, and used responsibly.',
    icon: '🔒',
    items: [
      {
        id: 'data-protection',
        question: 'How is my survey data protected?',
        answer:
          'Survey data is hosted on Qualtrics, which provides enterprise-grade security including encryption in transit and at rest. Access to raw data is restricted to authorized researchers. The survey does not collect your name or email address.',
      },
      {
        id: 'data-sharing',
        question: 'Is my individual data shared with third parties?',
        answer:
          'No. Individual responses are never shared. Only aggregate, de-identified results are published or shared with research partners. Your specific answers cannot be traced back to you.',
      },
      {
        id: 'data-retention',
        question: 'How long is survey data retained?',
        answer:
          'Survey data is retained for the duration of the longitudinal study to enable year-over-year trend analysis. Data is stored securely on Qualtrics servers and handled in accordance with the TABS privacy policy.',
      },
      {
        id: 'cookie-policy',
        question: 'Does the TABS website use cookies?',
        answer:
          'The TABS website uses a cookie consent system. Essential cookies are used for site functionality. Analytics and tracking cookies (Google Analytics, Microsoft Clarity) are only activated after you provide consent.',
      },
      {
        id: 'ethics-review',
        question: 'Has the TABS survey undergone ethics review?',
        answer:
          'Yes. The TABS survey has received IRB approval from Penn State University. The study follows established ethical research practices including informed consent, anonymity, voluntary participation, and the right to withdraw at any time without consequence.',
      },
    ],
  },
  {
    id: 'teaching',
    title: 'Teaching & Educational Resources',
    description: 'Resources for educators who want to use TABS in the classroom.',
    icon: '🎓',
    items: [
      {
        id: 'teaching-series',
        question: 'What is the TABS Teaching Series?',
        answer:
          'The Teaching Series is a comprehensive set of educational resources designed for classroom use. It includes a slide presentation with facilitator notes, handout materials, workshop guides, Q&A preparation, and a technology lifecycle assessment template.',
      },
      {
        id: 'teaching-audience',
        question: 'Who is the Teaching Series designed for?',
        answer:
          'The series is designed for university instructors, corporate trainers, workshop facilitators, and anyone who teaches or presents on technology adoption, digital transformation, or organizational change management.',
      },
      {
        id: 'teaching-free',
        question: 'Are the teaching resources free to use?',
        answer:
          'Yes. All Teaching Series materials are freely available on the TABS website. They can be used in academic courses, corporate training sessions, or professional development workshops with proper attribution.',
      },
      {
        id: 'article-series',
        question: 'What is the TABS Article Series?',
        answer:
          'The Article Series consists of 16 research articles organized into two branches: "The User\'s Journey" (exploring individual adoption experiences) and "The Organization\'s Playbook" (addressing organizational strategies). Each article includes a bibliography with full citations.',
      },
      {
        id: 'cite-tabs',
        question: 'How should I cite TABS in academic work?',
        answer:
          'Citation information is available on the TABS website in CFF (Citation File Format). You can also find a CITATION.cff file in the project repository with complete citation metadata for academic reference managers.',
      },
    ],
  },
]

/** Flat list of all FAQ items for search functionality */
export const allFaqItems: (FaqItem & { categoryId: string; categoryTitle: string })[] =
  faqCategories.flatMap((cat) =>
    cat.items.map((item) => ({
      ...item,
      categoryId: cat.id,
      categoryTitle: cat.title,
    }))
  )
