import React from 'react'
import Hero from '@/components/tabs-page/Hero'
import TealValueProp from '@/components/tabs-page/TealValueProp'
import GetInvolved from '@/components/tabs-page/GetInvolved'
import DonationCards from '@/components/tabs-page/DonationCards'
import Statistics from '@/components/tabs-page/Statistics'
import MissionOverview from '@/components/tabs-page/MissionOverview'
import SimplePitch from '@/components/tabs-page/SimplePitch'

/**
 * TABS Homepage
 * 1:1 Parity with Live Site (technologyadoptionbarriers.org)
 * Structural alignment: Hero -> Teal -> Involved -> Donations -> Stats -> Mission -> Pitch
 * Note: BottomCTA has been merged into the Footer component
 */
const TABSHome = () => {
  return (
    <div className="scroll-smooth pt-[80px]">
      <Hero />
      <TealValueProp />
      <GetInvolved />
      <DonationCards />
      <Statistics />
      <MissionOverview />
      <SimplePitch />
    </div>
  )
}

export default TABSHome
