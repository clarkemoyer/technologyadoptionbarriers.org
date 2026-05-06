import { MarkerType } from '@xyflow/react'
import type { Edge, Node } from '@xyflow/react'

export type Category =
  | 'sociology'
  | 'psychology'
  | 'intention'
  | 'acceptance'
  | 'motivation'
  | 'task'
  | 'success'
  | 'organizational'
  | 'process'
  | 'expectation'

export type ConceptNodeData = {
  label: string
  category: Category
}

export const initialNodes: Node<ConceptNodeData>[] = [
  // Foundational Sociology
  {
    id: 'doi',
    data: { label: 'Diffusion of Innovations (DOI)\nRogers, 1962', category: 'sociology' },
    position: { x: 50, y: 150 },
    type: 'concept',
  },
  {
    id: 'idt',
    data: {
      label: 'Innovation Diffusion Theory (IDT)\nMoore & Benbasat, 1991',
      category: 'sociology',
    },
    position: { x: 50, y: 300 },
    type: 'concept',
  },

  // Psychology / Behavioral
  {
    id: 'sct',
    data: { label: 'Social Cognitive Theory (SCT)\nBandura, 1986', category: 'psychology' },
    position: { x: 350, y: 50 },
    type: 'concept',
  },
  {
    id: 'ttm',
    data: {
      label: 'Transtheoretical Model (TTM)\nProchaska & DiClemente, 1983',
      category: 'psychology',
    },
    position: { x: 350, y: -50 },
    type: 'concept',
  },

  // Core Intentions
  {
    id: 'tra',
    data: {
      label: 'Theory of Reasoned Action (TRA)\nFishbein & Ajzen, 1975',
      category: 'intention',
    },
    position: { x: 650, y: 50 },
    type: 'concept',
  },
  {
    id: 'tpb',
    data: { label: 'Theory of Planned Behavior (TPB)\nAjzen, 1985', category: 'intention' },
    position: { x: 650, y: 200 },
    type: 'concept',
  },
  {
    id: 'dtpb',
    data: {
      label: 'Decomposed Theory of Planned Behavior (DTPB)\nTaylor & Todd, 1995',
      category: 'intention',
    },
    position: { x: 950, y: 200 },
    type: 'concept',
  },

  // Tech Acceptance
  {
    id: 'tam',
    data: { label: 'Technology Acceptance Model (TAM)\nDavis, 1989', category: 'acceptance' },
    position: { x: 650, y: 350 },
    type: 'concept',
  },
  {
    id: 'tam2',
    data: { label: 'TAM2\nVenkatesh & Davis, 2000', category: 'acceptance' },
    position: { x: 650, y: 500 },
    type: 'concept',
  },
  {
    id: 'tam3',
    data: { label: 'TAM3\nVenkatesh & Bala, 2008', category: 'acceptance' },
    position: { x: 650, y: 650 },
    type: 'concept',
  },

  {
    id: 'utaut',
    data: {
      label: 'Unified Theory of Acceptance and Use of Technology (UTAUT)\nVenkatesh et al., 2003',
      category: 'acceptance',
    },
    position: { x: 950, y: 500 },
    type: 'concept',
  },
  {
    id: 'utaut2',
    data: { label: 'UTAUT2\nVenkatesh et al., 2012', category: 'acceptance' },
    position: { x: 950, y: 650 },
    type: 'concept',
  },

  {
    id: 'ctamtpb',
    data: {
      label: 'Combined TAM and TPB (C-TAM-TPB)\nTaylor & Todd, 1995',
      category: 'acceptance',
    },
    position: { x: 950, y: 350 },
    type: 'concept',
  },

  // Motivation/PC
  {
    id: 'mm',
    data: { label: 'Motivational Model (MM)\nDavis et al., 1992', category: 'motivation' },
    position: { x: 1250, y: 200 },
    type: 'concept',
  },
  {
    id: 'mpcu',
    data: {
      label: 'Model of PC Utilization (MPCU)\nThompson et al., 1991',
      category: 'motivation',
    },
    position: { x: 1250, y: 350 },
    type: 'concept',
  },

  // Task / Fit
  {
    id: 'ttf',
    data: { label: 'Task-Technology Fit (TTF)\nGoodhue & Thompson, 1995', category: 'task' },
    position: { x: 350, y: 500 },
    type: 'concept',
  },

  // Success
  {
    id: 'issm',
    data: { label: 'IS Success Model\nDeLone & McLean, 1992', category: 'success' },
    position: { x: 1250, y: 500 },
    type: 'concept',
  },
  {
    id: 'issm2',
    data: { label: 'Updated IS Success Model\nDeLone & McLean, 2003', category: 'success' },
    position: { x: 1250, y: 650 },
    type: 'concept',
  },

  // Organizational / Environmental
  {
    id: 'toe',
    data: {
      label: 'Technology-Organization-Environment (TOE)\nTornatzky & Fleischer, 1990',
      category: 'organizational',
    },
    position: { x: 350, y: 800 },
    type: 'concept',
  },
  {
    id: 'inst',
    data: { label: 'Institutional Theory\nDiMaggio & Powell, 1983', category: 'organizational' },
    position: { x: 50, y: 800 },
    type: 'concept',
  },

  // Process / Concerns
  {
    id: 'cbam',
    data: { label: 'Concerns-Based Adoption Model (CBAM)\nHall et al., 1977', category: 'process' },
    position: { x: 50, y: 500 },
    type: 'concept',
  },
  {
    id: 'tri',
    data: { label: 'Technology Readiness Index (TRI)\nParasuraman, 2000', category: 'process' },
    position: { x: 50, y: 650 },
    type: 'concept',
  },
  {
    id: 'tram',
    data: {
      label: 'Technology Readiness and Acceptance Model (TRAM)\nLin et al., 2007',
      category: 'process',
    },
    position: { x: 350, y: 650 },
    type: 'concept',
  },

  // Expectation
  {
    id: 'ecm',
    data: {
      label: 'Expectation-Confirmation Model (ECM)\nBhattacherjee, 2001',
      category: 'expectation',
    },
    position: { x: 950, y: 800 },
    type: 'concept',
  },
]

export const initialEdges: Edge[] = [
  {
    id: 'e1',
    source: 'doi',
    target: 'idt',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e2',
    source: 'tra',
    target: 'tpb',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e3',
    source: 'tpb',
    target: 'dtpb',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e4',
    source: 'tra',
    target: 'tam',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e5',
    source: 'tam',
    target: 'tam2',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e6',
    source: 'tam2',
    target: 'tam3',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e7',
    source: 'tpb',
    target: 'ctamtpb',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e8',
    source: 'tam',
    target: 'ctamtpb',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e9',
    source: 'sct',
    target: 'utaut',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e10',
    source: 'mm',
    target: 'utaut',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e11',
    source: 'mpcu',
    target: 'utaut',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e12',
    source: 'tam',
    target: 'utaut',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e13',
    source: 'tpb',
    target: 'utaut',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e14',
    source: 'idt',
    target: 'utaut',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e15',
    source: 'utaut',
    target: 'utaut2',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e16',
    source: 'issm',
    target: 'issm2',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e17',
    source: 'tam',
    target: 'issm',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e18',
    source: 'tri',
    target: 'tram',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e19',
    source: 'tam',
    target: 'tram',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e20',
    source: 'tam',
    target: 'ecm',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e21',
    source: 'ttf',
    target: 'utaut',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
]
