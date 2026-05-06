import type { Metadata } from 'next'
import voiceData from '@/data/participant-voice.json'
import {
  ParticipantVoiceContent,
  type ParticipantVoiceData,
} from '@/components/results/participant-voice/ParticipantVoiceContent'

export const metadata: Metadata = {
  title: 'Participant Voice - TABS Results',
  description:
    'Open-ended feedback from 162 of 200 TABS survey respondents (81% engagement). Curated quotes alongside theme distributions and length-of-engagement buckets.',
  alternates: {
    canonical: '/results/participant-voice',
  },
}

/**
 * Search-index seed - the page renders the shared ParticipantVoiceContent
 * component, so generate-search-index.ts cannot extract meaningful text from
 * this shell. This template literal is picked up in place of the auto-extract.
 */
export const SEARCH_CONTENT = `Participant Voice for the Technology Adoption Barriers Survey: 162 of 200 respondents (81%) wrote open-ended Q74 feedback, including 12 mini-essays over 500 characters each. The page surfaces engagement statistics, length distribution buckets, theme distribution across 19 categories (workforce skills and training, leadership/culture/change, budget and cost, AI/ML adoption, legacy systems and integration, pace of change, vendor and third-party concerns, security and compliance), and curated quotes organized into mini-essays, insights ("what participants would have asked about"), critiques of the instrument itself, and affirmations. Data is from the frozen N=200 CRP 2026 dataset; quotes are pseudonymized and screened for identifying detail before publication.`

export default function ParticipantVoiceLivePage() {
  return <ParticipantVoiceContent variant="live" data={voiceData as ParticipantVoiceData} />
}
