import React from 'react'
import Hero from '@/components/tabs-page/Hero'
import GetInvolved from '@/components/tabs-page/GetInvolved'
import Statistics from '@/components/tabs-page/Statistics'
import Impact from '@/components/tabs-page/Impact'
import Barriers from '@/components/tabs/Barriers'
import FrequentlyAskedQuestions from '@/components/home-page/FrequentlyAskedQuestions'
import Contact from '@/components/tabs-page/Contact'
import SectionDivider from '@/components/tabs-page/SectionDivider'

/**
 * TABS Homepage
 * Technology Adoption Barriers Survey main page
 * Enhanced with improved design, visual separators, and comprehensive sections
 */
const TABSHome = () => {
  return (
    <div className="scroll-smooth">
      <Hero />
      <SectionDivider variant="simple" />
      <GetInvolved />
      <SectionDivider variant="gradient" />
      <Statistics />
      <SectionDivider variant="simple" />
      <Impact />
      <SectionDivider variant="gradient" />
      <Barriers />
      <SectionDivider variant="simple" />
      <FrequentlyAskedQuestions />
      <Contact />
    </div>
  )
}

export default TABSHome
