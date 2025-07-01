"use client"

interface SalesChartProps {
  data: Array<{
    month: string
    revenue: number
    opportunities: number
    deals: number
    conversion: number
  }>
}

export function SalesChart({ data }: SalesChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue))

  return (
    <div className="space-y-4">
      <div className="flex items-end space-x-2 h-64">
        {data.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${item.month}: ${(item.revenue / 1000000).toFixed(1)}M FCFA`}
                />
                <div className="text-xs mt-2 text-center font-medium">{item.month}</div>
                <div className="text-xs text-muted-foreground">{(item.revenue / 1000000).toFixed(1)}M</div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>{(maxRevenue / 1000000).toFixed(0)}M FCFA</span>
      </div>
    </div>
  )
}
