"use client"

interface TopClientsChartProps {
  data: Array<{
    name: string
    revenue: number
    deals: number
    lastDeal: string
  }>
}

export function TopClientsChart({ data }: TopClientsChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue))

  return (
    <div className="space-y-3">
      {data.map((client, index) => {
        const percentage = (client.revenue / maxRevenue) * 100
        return (
          <div key={client.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">#{index + 1}</span>
                <span className="text-sm">{client.name}</span>
              </div>
              <span className="text-sm font-semibold">{(client.revenue / 1000000).toFixed(1)}M</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
