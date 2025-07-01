"use client"

interface ConversionChartProps {
  data: Array<{
    month: string
    revenue: number
    opportunities: number
    deals: number
    conversion: number
  }>
}

export function ConversionChart({ data }: ConversionChartProps) {
  const maxConversion = Math.max(...data.map((d) => d.conversion))
  const minConversion = Math.min(...data.map((d) => d.conversion))

  return (
    <div className="space-y-4">
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          <defs>
            <linearGradient id="conversionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grille */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={y} x1="0" y1={200 - y * 2} x2="400" y2={200 - y * 2} stroke="#e5e7eb" strokeWidth="1" />
          ))}

          {/* Ligne de conversion */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            points={data
              .map((item, index) => {
                const x = (index / (data.length - 1)) * 400
                const y = 200 - (item.conversion / 100) * 200
                return `${x},${y}`
              })
              .join(" ")}
          />

          {/* Zone sous la courbe */}
          <polygon
            fill="url(#conversionGradient)"
            points={`0,200 ${data
              .map((item, index) => {
                const x = (index / (data.length - 1)) * 400
                const y = 200 - (item.conversion / 100) * 200
                return `${x},${y}`
              })
              .join(" ")} 400,200`}
          />

          {/* Points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 400
            const y = 200 - (item.conversion / 100) * 200
            return <circle key={index} cx={x} cy={y} r="4" fill="#10b981" stroke="white" strokeWidth="2" />
          })}
        </svg>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        {data.map((item, index) => (
          <span key={index} className="text-center">
            <div>{item.month}</div>
            <div className="font-medium text-green-600">{item.conversion}%</div>
          </span>
        ))}
      </div>
    </div>
  )
}
