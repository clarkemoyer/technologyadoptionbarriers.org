import React from 'react'

interface ItemStat {
  name: string
  mean: number | null
  sd: number | null
  rank: number
  n: number
}

interface ItemStatsTableProps {
  title: string
  items: ItemStat[]
  highlightedItems?: Set<string>
  maxMean?: number
}

const ItemStatsTable: React.FC<ItemStatsTableProps> = ({
  title,
  items,
  highlightedItems,
  maxMean = 5,
}) => {
  return (
    <div className="mb-6">
      <h4 className="text-xs font-bold text-gray-600 uppercase mb-2 tracking-wider">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse bg-white/70 rounded shadow-sm">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-100/50">
              <th scope="col" className="py-2 px-2 text-left font-semibold text-gray-600 w-12">
                Rank
              </th>
              <th scope="col" className="py-2 px-2 text-left font-semibold text-gray-600">
                Item
              </th>
              <th scope="col" className="py-2 px-2 text-right font-semibold text-gray-600 w-16">
                Mean
              </th>
              <th scope="col" className="py-2 px-2 text-left font-semibold text-gray-600 w-24">
                Visualization
              </th>
              <th scope="col" className="py-2 px-2 text-right font-semibold text-gray-600 w-16">
                SD
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isHighlighted = highlightedItems?.has(item.name)
              const barWidth = item.mean ? (item.mean / maxMean) * 100 : 0

              return (
                <tr
                  key={item.name}
                  className={`border-b border-gray-200 transition-colors ${
                    isHighlighted ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-2 px-2 font-mono text-gray-500">{item.rank}</td>
                  <td className={`py-2 px-2 font-medium ${isHighlighted ? 'text-amber-900' : ''}`}>
                    {item.name}
                    {isHighlighted && (
                      <span
                        className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight bg-amber-200 text-amber-800 rounded"
                        title="Rank shifter: significant position change across result groups"
                      >
                        Shift
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold">
                    {item.mean?.toFixed(2) ?? '—'}
                  </td>
                  <td className="py-2 px-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isHighlighted ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${barWidth}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-gray-500">
                    {item.sd?.toFixed(2) ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ItemStatsTable
