import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts'

type Props = { metrics: { claims_by_error_type: any; paid_amount_by_error_type: any } }

export default function ErrorCharts({ metrics }: Props) {
  const keys = Object.keys(metrics.claims_by_error_type || {})
  const data = keys.map(k => ({ type: k, count: metrics.claims_by_error_type[k], paid: metrics.paid_amount_by_error_type[k] }))
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 shadow rounded">
        <div className="font-semibold mb-2">Claim counts by error category</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" /><YAxis />
            <Tooltip /><Legend />
            <Bar dataKey="count" fill="#2563eb" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-4 shadow rounded">
        <div className="font-semibold mb-2">Paid amount by error category</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" /><YAxis />
            <Tooltip /><Legend />
            <Bar dataKey="paid" fill="#16a34a" name="Paid (AED)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}


