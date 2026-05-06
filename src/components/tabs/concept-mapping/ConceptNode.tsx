import React from 'react'
import { Handle, Position } from '@xyflow/react'
import type { Category } from '@/data/concept-map-data'

interface ConceptNodeProps {
  data: {
    label: string
    category: Category
  }
}

const getCategoryColor = (category: Category) => {
  switch (category) {
    case 'sociology':
      return 'bg-pink-100 border-pink-500 text-pink-900'
    case 'psychology':
      return 'bg-red-100 border-red-500 text-red-900'
    case 'intention':
      return 'bg-blue-100 border-blue-500 text-blue-900'
    case 'acceptance':
      return 'bg-blue-200 border-blue-600 text-blue-950'
    case 'motivation':
      return 'bg-sky-100 border-sky-400 text-sky-900'
    case 'task':
      return 'bg-teal-100 border-teal-500 text-teal-900'
    case 'success':
      return 'bg-indigo-100 border-indigo-500 text-indigo-900'
    case 'organizational':
      return 'bg-yellow-100 border-yellow-500 text-yellow-900'
    case 'process':
      return 'bg-purple-100 border-purple-500 text-purple-900'
    case 'expectation':
      return 'bg-gray-100 border-gray-500 text-gray-900'
    default:
      return 'bg-white border-gray-300 text-gray-800'
  }
}

export const ConceptNode: React.FC<ConceptNodeProps> = ({ data }) => {
  const [title, author] = data.label.split('\n')

  return (
    <div
      className={`px-4 py-3 shadow-md rounded-2xl border-2 ${getCategoryColor(data.category)} w-64 text-center transition-transform hover:scale-105`}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 opacity-0" id="left" />

      <div className="flex flex-col justify-center min-h-[3rem]">
        <span className="font-bold text-sm leading-tight mb-1">{title}</span>
        {author && <span className="text-xs font-medium opacity-80">{author}</span>}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 opacity-0" id="right" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
    </div>
  )
}
