import type { Metadata } from 'next'
import TABSHome from '@/app/tabs-home'

export const metadata: Metadata = {
  title: "Technology Adoption Barriers Survey (TABS) | What's in your way?",
  description:
    'Technology Adoption Barriers Survey (TABS) collects insights from organizational leaders to identify and overcome obstacles to technology adoption. Know the Barriers, Break the Barriers.',
}

const page = () => {
  return (
    <div>
      <TABSHome />
    </div>
  )
}

export default page
