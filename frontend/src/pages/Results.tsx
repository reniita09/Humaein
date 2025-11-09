import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import ErrorCharts from '../charts/ErrorCharts'

type Item = {
  claim_id: string
  status: string
  error_type: string
  explanation: string
  recommended_action: string
  encounter_type?: string
  service_code?: string
  facility_id?: string
  paid_amount_aed?: number
  diagnosis_codes?: string
}

const errorLookup: Record<string, { icon: string; label: string; tone: string }> = {
  no_error: { icon: '✅', label: 'No Error', tone: 'text-green-600' },
  technical_error: { icon: '⚠️', label: 'Technical Error', tone: 'text-amber-600' },
  medical_error: { icon: '⚠️', label: 'Medical Error', tone: 'text-amber-600' },
  both: { icon: '⚠️', label: 'Both', tone: 'text-red-600' },
}

export default function Results() {
  const { jobId } = useParams()
  const [items, setItems] = useState<Item[]>([])
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    const loadClaims = async () => {
      const pageSize = 100
      let page = 1
      let collected: Item[] = []
      while (true) {
        const { data } = await api.get('/api/claims', { params: { job_id: jobId, page, page_size: pageSize } })
        collected = [...collected, ...data.items]
        if (collected.length >= data.total || data.items.length === 0) break
        page += 1
      }
      setItems(collected)
      const m = await api.get(`/api/metrics/ingestion/${jobId}`)
      setMetrics(m.data)
    }
    if (jobId) loadClaims()
  }, [jobId])

  const rows = useMemo(() => {
    const sorted = [...items].sort((a, b) => Number(a.claim_id) - Number(b.claim_id))
    return sorted.map(r => {
      const meta = errorLookup[r.error_type] || { icon: '', label: r.error_type, tone: 'text-gray-700' }
      return { ...r, meta }
    })
  }, [items])

  const handleExport = async () => {
    if (!jobId) return
    const response = await api.get(`/api/export/${jobId}.csv`, { responseType: 'blob' })
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `validation_${jobId}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-[80vh] bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">
          Results for Job {jobId}
        </h1>

        {metrics && (
          <div className="mb-8">
            <ErrorCharts metrics={metrics} />
          </div>
        )}

        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="p-3 font-semibold text-gray-700">Claim ID</th>
                <th className="p-3 font-semibold text-gray-700">Encounter Type</th>
                <th className="p-3 font-semibold text-gray-700">Service Code</th>
                <th className="p-3 font-semibold text-gray-700">Facility</th>
                <th className="p-3 font-semibold text-gray-700">Paid (AED)</th>
                <th className="p-3 font-semibold text-gray-700">Diagnoses</th>
                <th className="p-3 font-semibold text-gray-700">Error Type</th>
                <th className="p-3 font-semibold text-gray-700">Status</th>
                <th className="p-3 font-semibold text-gray-700">Explanation</th>
                <th className="p-3 font-semibold text-gray-700">Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.claim_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">{row.claim_id}</td>
                  <td className="p-3 text-gray-700">{row.encounter_type || '-'}</td>
                  <td className="p-3 text-gray-700">{row.service_code || '-'}</td>
                  <td className="p-3 text-gray-700">{row.facility_id || '-'}</td>
                  <td className="p-3 text-gray-700">
                    {typeof row.paid_amount_aed === 'number'
                      ? row.paid_amount_aed.toFixed(2)
                      : '-'}
                  </td>
                  <td className="p-3 text-sm text-gray-700">
                    {row.diagnosis_codes?.split('`').join(', ') || '-'}
                  </td>
                  <td className={`p-3 ${row.meta.tone}`}>
                    {row.meta.icon} {row.meta.label}
                  </td>
                  <td
                    className={`p-3 ${
                      row.status === 'Validated'
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}
                  >
                    {row.status}
                  </td>
                  <td className="p-3 text-sm text-gray-700 whitespace-pre-line">
                    {row.explanation}
                  </td>
                  <td className="p-3 text-sm text-gray-700 whitespace-pre-line">
                    {row.recommended_action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={handleExport}
            className="text-teal-600 hover:text-teal-800 underline font-medium"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}
