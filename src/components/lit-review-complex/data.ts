export type NodeType = 'source' | 'author' | 'concept' | 'draft' | 'output'

export interface NodeItem {
  id: string
  label: string
  type: NodeType
  colorClass?: string
  subLabel?: string
}

export interface Connection {
  source: string
  target: string
  color?: string
}

export const columns: { id: string; title: string; type: NodeType }[] = [
  { id: 'col1', title: 'Source Pool', type: 'source' },
  { id: 'col2', title: 'Key Authors', type: 'author' },
  { id: 'col3', title: 'Key Concepts', type: 'concept' },
  { id: 'col4', title: 'Paper Drafts', type: 'draft' },
  { id: 'col5', title: 'Final Outputs', type: 'output' },
]

export const nodes: NodeItem[] = [
  // Sources
  { id: 'src1', label: 'Journal of Finance', type: 'source' },
  { id: 'src2', label: 'Quarterly Journal of Economics', type: 'source' },
  { id: 'src3', label: 'American Economic Review', type: 'source' },
  { id: 'src4', label: 'Journal of Political Economy', type: 'source' },
  { id: 'src5', label: 'Review of Economic Studies', type: 'source' },
  { id: 'src6', label: 'NBER Working Papers', type: 'source' },

  // Authors
  {
    id: 'auth1',
    label: 'Smith, J.',
    subLabel: 'Behavioral Finance',
    type: 'author',
    colorClass: 'border-blue-500',
  },
  {
    id: 'auth2',
    label: 'Johnson, A.',
    subLabel: 'Market Microstructure',
    type: 'author',
    colorClass: 'border-green-500',
  },
  {
    id: 'auth3',
    label: 'Williams, R.',
    subLabel: 'Asset Pricing',
    type: 'author',
    colorClass: 'border-purple-500',
  },
  {
    id: 'auth4',
    label: 'Brown, T.',
    subLabel: 'Corporate Finance',
    type: 'author',
    colorClass: 'border-orange-500',
  },

  // Concepts
  {
    id: 'conc1',
    label: 'Market Efficiency',
    type: 'concept',
    colorClass: 'bg-slate-800 border-slate-600',
  },
  {
    id: 'conc2',
    label: 'Information Asymmetry',
    type: 'concept',
    colorClass: 'bg-slate-800 border-slate-600',
  },
  {
    id: 'conc3',
    label: 'Liquidity Premium',
    type: 'concept',
    colorClass: 'bg-slate-800 border-slate-600',
  },
  {
    id: 'conc4',
    label: 'Behavioral Biases',
    type: 'concept',
    colorClass: 'bg-slate-800 border-slate-600',
  },
  {
    id: 'conc5',
    label: 'Agency Costs',
    type: 'concept',
    colorClass: 'bg-slate-800 border-slate-600',
  },

  // Drafts
  {
    id: 'draft1',
    label: 'Lit Review Section 1',
    subLabel: 'Efficiency & Information',
    type: 'draft',
  },
  { id: 'draft2', label: 'Lit Review Section 2', subLabel: 'Behavioral Aspects', type: 'draft' },
  { id: 'draft3', label: 'Methodology Outline', subLabel: 'Data & Approach', type: 'draft' },

  // Outputs
  {
    id: 'out1',
    label: 'Working Paper',
    subLabel: 'SSRN Submission',
    type: 'output',
    colorClass: 'bg-indigo-900 border-indigo-500',
  },
  {
    id: 'out2',
    label: 'Conference Presentation',
    subLabel: 'AFA Annual Meeting',
    type: 'output',
    colorClass: 'bg-indigo-900 border-indigo-500',
  },
]

export const connections: Connection[] = [
  // Src -> Auth
  { source: 'src1', target: 'auth1' },
  { source: 'src1', target: 'auth3' },
  { source: 'src2', target: 'auth2' },
  { source: 'src3', target: 'auth1' },
  { source: 'src3', target: 'auth4' },
  { source: 'src4', target: 'auth2' },
  { source: 'src4', target: 'auth3' },
  { source: 'src5', target: 'auth4' },
  { source: 'src6', target: 'auth1' },
  { source: 'src6', target: 'auth2' },

  // Auth -> Concept
  { source: 'auth1', target: 'conc1', color: '#3b82f6' },
  { source: 'auth1', target: 'conc4', color: '#3b82f6' },
  { source: 'auth2', target: 'conc2', color: '#22c55e' },
  { source: 'auth2', target: 'conc3', color: '#22c55e' },
  { source: 'auth3', target: 'conc1', color: '#a855f7' },
  { source: 'auth3', target: 'conc3', color: '#a855f7' },
  { source: 'auth4', target: 'conc2', color: '#f97316' },
  { source: 'auth4', target: 'conc5', color: '#f97316' },

  // Concept -> Draft
  { source: 'conc1', target: 'draft1' },
  { source: 'conc2', target: 'draft1' },
  { source: 'conc3', target: 'draft1' },
  { source: 'conc4', target: 'draft2' },
  { source: 'conc5', target: 'draft2' },
  { source: 'conc1', target: 'draft3' },
  { source: 'conc2', target: 'draft3' },

  // Draft -> Output
  { source: 'draft1', target: 'out1' },
  { source: 'draft2', target: 'out1' },
  { source: 'draft3', target: 'out1' },
  { source: 'draft1', target: 'out2' },
  { source: 'draft2', target: 'out2' },
]
