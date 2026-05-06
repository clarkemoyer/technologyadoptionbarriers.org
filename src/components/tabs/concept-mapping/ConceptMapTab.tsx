'use client'

import React, { useMemo } from 'react'
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, Panel } from '@xyflow/react'

import { initialNodes, initialEdges } from '@/data/concept-map-data'
import { ConceptNode } from './ConceptNode'

const nodeTypes = {
  concept: ConceptNode,
}

export default function ConceptMapTab() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const memoizedNodeTypes = useMemo(() => nodeTypes, [])

  return (
    <div className="w-full h-screen min-h-[800px] border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={memoizedNodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background gap={16} size={1} />
        <Controls />
        <Panel
          position="top-left"
          className="bg-white/90 p-4 rounded-lg shadow-md border border-gray-200 m-4"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-2">Technology Adoption Models</h3>
          <p className="text-sm text-gray-600 mb-3 max-w-xs">
            Interactive map exploring the landscape of technology adoption models and frameworks
            over time.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-400"></div>Sociology
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>Psychology
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>Intentions
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>Tech Acceptance
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-400"></div>Motivation
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-400"></div>Task/Fit
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-400"></div>Success
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>Organizational
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>Process
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>Expectation
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
