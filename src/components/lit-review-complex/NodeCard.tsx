'use client'

import React from 'react'
import { NodeItem } from './data'
import { FileText, User, Tag, FileEdit, BookOpen } from 'lucide-react'

interface NodeCardProps {
  node: NodeItem
}

export default function NodeCard({ node }: NodeCardProps) {
  // Icon and default styling mapping based on node type
  let Icon = FileText
  let baseColorClass = 'bg-slate-800/80 border-slate-700 text-slate-200'

  switch (node.type) {
    case 'source':
      Icon = BookOpen
      baseColorClass = 'bg-slate-900 border-slate-700 text-slate-300'
      break
    case 'author':
      Icon = User
      baseColorClass = 'bg-slate-800 border-slate-600 text-slate-200'
      break
    case 'concept':
      Icon = Tag
      baseColorClass = 'bg-slate-800 border-slate-600 text-slate-200'
      break
    case 'draft':
      Icon = FileEdit
      baseColorClass = 'bg-slate-800 border-slate-600 text-slate-200'
      break
    case 'output':
      Icon = FileText
      baseColorClass = 'bg-indigo-950 border-indigo-800 text-indigo-100'
      break
  }

  // Override with specific color class if provided in data
  const finalClass = node.colorClass ? node.colorClass : baseColorClass

  return (
    <div
      id={`node-${node.id}`}
      className={`relative z-10 flex flex-col p-3 rounded-md border-l-4 shadow-sm backdrop-blur-sm transition-transform hover:scale-105 hover:z-20 cursor-default ${finalClass}`}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="opacity-70" />
        <span className="text-sm font-medium tracking-tight truncate leading-tight">
          {node.label}
        </span>
      </div>
      {node.subLabel && <span className="text-xs opacity-60 truncate mt-1">{node.subLabel}</span>}
    </div>
  )
}
