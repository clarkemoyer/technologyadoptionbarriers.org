import Hero from '@/components/tabs-page/hero'
import SeeYourselfTeaser from '@/components/tabs-page/see-yourself-teaser'
import TealValueProp from '@/components/tabs-page/teal-value-prop'
import GetInvolved from '@/components/tabs-page/get-involved'
import SupportCards from '@/components/tabs-page/support-cards'
import Statistics from '@/components/tabs-page/statistics'
import LiveResults from '@/components/tabs-page/live-results'
import MissionOverview from '@/components/tabs-page/mission-overview'
import SimplePitch from '@/components/tabs-page/simple-pitch'

/**
 * TABS Homepage
 * 1:1 Parity with Live Site (technologyadoptionbarriers.org)
 * Structural alignment: Hero -> SeeYourselfTeaser -> Teal -> Involved -> Support -> Stats -> LiveResults -> Mission -> Pitch
 * Note: BottomCTA has been merged into the Footer component
 */
const TABSHome = () => {
  return (
    <div className="scroll-smooth pt-[80px]">
      <Hero />
      <SeeYourselfTeaser />
      <TealValueProp />
      <GetInvolved />
      <SupportCards />
      <Statistics />
      <LiveResults />
      <MissionOverview />
      <SimplePitch />
    </div>
  )
}

export default TABSHome
