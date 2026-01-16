import React from 'react'
import Hero from '@/components/tabs-page/Hero'
import TealValueProp from '@/components/tabs-page/TealValueProp'
import GetInvolved from '@/components/tabs-page/GetInvolved'
import DonationCards from '@/components/tabs-page/DonationCards'
import Statistics from '@/components/tabs-page/Statistics'
import MissionOverview from '@/components/tabs-page/MissionOverview'
import SimplePitch from '@/components/tabs-page/SimplePitch'
import BottomCTA from '@/components/tabs-page/BottomCTA'

/**
 * TABS Homepage
 * 1:1 Parity with Live Site (technologyadoptionbarriers.org)
 * Strict structural alignment: Hero -> Teal -> Involved -> Donations -> Stats -> Mission -> Pitch -> BottomCTA
 */
const TABSHome = () => {
  return (
    <div className="scroll-smooth">
      <Hero />
      <TealValueProp />
      <GetInvolved />
      <DonationCards />
      <Statistics />
      <MissionOverview />
      <SimplePitch />
      <BottomCTA />
    </div>
  )
}

export default TABSHome
