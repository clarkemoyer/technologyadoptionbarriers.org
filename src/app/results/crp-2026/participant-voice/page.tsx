import type { Metadata } from 'next'
import voiceData from '@/data/participant-voice.json'
import {
  ParticipantVoiceContent,
  type ParticipantVoiceData,
} from '@/components/results/participant-voice/ParticipantVoiceContent'

export const metadata: Metadata = {
  title: 'CRP 2026 Participant Voice - TABS Results',
  description:
    'Open-ended Q74 feedback from the frozen N=200 CRP 2026 sample. 81% engagement, 12 mini-essays, 19 themes, curated quotes by category.',
  alternates: {
    canonical: '/results/crp-2026/participant-voice',
  },
}

/**
 * Search-index seed - same content shape as the live page; the data source is
 * the frozen CRP 2026 dataset specifically.
 */
export const SEARCH_CONTENT = `CRP 2026 Participant Voice for the Technology Adoption Barriers Survey: 162 of 200 frozen-sample respondents (81%) wrote open-ended Q74 feedback, including 12 mini-essays over 500 characters each. The page surfaces engagement statistics, length distribution buckets, theme distribution across 19 categories (workforce skills and training, leadership/culture/change, budget and cost, AI/ML adoption, legacy systems and integration, pace of change, vendor and third-party concerns, security and compliance), and curated quotes organized into mini-essays, insights, critiques of the instrument itself, and affirmations. Quotes are pseudonymized and screened for identifying detail before publication.`

export default function ParticipantVoiceCrpPage() {
  return <ParticipantVoiceContent variant="crp" data={voiceData as ParticipantVoiceData} />
}
