import React from 'react'
import Hero from '@/components/tabs-page/Hero'
import GetInvolved from '@/components/tabs-page/GetInvolved'
import Statistics from '@/components/tabs-page/Statistics'
import Barriers from '@/components/tabs/Barriers'
import FrequentlyAskedQuestions from '@/components/home-page/FrequentlyAskedQuestions'

/**
 * TABS Homepage
 * Technology Adoption Barriers Survey main page
 */
const TABSHome = () => {
  return (
    <div>
      <Hero />
      <GetInvolved />
      <Statistics />
      <Barriers />
      <FrequentlyAskedQuestions />
    </div>
  )
}

export default TABSHome
