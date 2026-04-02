'use client'

/**
 * Reusable download buttons for concept mapping views.
 * Provides Excel (.xlsx) and CSV export for any row-based data.
 */

type RowData = Record<string, string | number | null>

function exportCsv(headers: string[], data: RowData[], filename: string) {
  const csvHeaders = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',')
  const csvRows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h] ?? ''
        return `"${String(val).replace(/"/g, '""')}"`
      })
      .join(',')
  )
  const csv = [csvHeaders, ...csvRows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  setTimeout(() => {
    URL.revokeObjectURL(url)
    link.remove()
  }, 100)
}

async function exportExcel(headers: string[], data: RowData[], filename: string) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Data')

  ws.columns = headers.map((h) => ({
    header: h,
    key: h,
    width: Math.min(
      40,
      Math.max(
        h.length + 2,
        ...data.map((r) => String(r[h] ?? '').length).map((l) => Math.min(l, 40))
      )
    ),
  }))

  for (const row of data) {
    ws.addRow(Object.fromEntries(headers.map((h) => [h, row[h] ?? ''])))
  }

  ws.getRow(1).font = { bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  setTimeout(() => {
    URL.revokeObjectURL(url)
    link.remove()
  }, 100)
}

interface DownloadButtonsProps {
  headers: string[]
  data: RowData[]
  filenameBase: string
  label?: string
}

export default function DownloadButtons({
  headers,
  data,
  filenameBase,
  label = 'data',
}: DownloadButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => exportExcel(headers, data, `${filenameBase}.xlsx`).catch(console.error)}
        className="px-4 py-2 bg-tabs-teal text-white text-sm font-medium rounded-lg hover:bg-tabs-teal-deep transition-colors"
        aria-label={`Download ${label} as Excel spreadsheet`}
      >
        Download Excel
      </button>
      <button
        onClick={() => exportCsv(headers, data, `${filenameBase}.csv`)}
        className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        aria-label={`Download ${label} as CSV`}
      >
        CSV
      </button>
    </div>
  )
}
