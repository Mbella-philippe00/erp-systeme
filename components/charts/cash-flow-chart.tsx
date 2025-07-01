"use client"

interface CashFlowChartProps {
  data: Array<{
    month: string
    inflow: number
    outflow: number
  }>
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.inflow, d.outflow)))
  const barWidth = 100 / (data.length * 2 + (data.length - 1)) // Width for each bar considering spacing

  return (
    <div className="h-full">
      <svg className="w-full h-full" viewBox="0 0 1000 400">
        {/* Grille horizontale */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = 350 - (percent / 100) * 350
          return (
            <g key={`grid-${percent}`}>
              <line x1="50" y1={y} x2="950" y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x="20" y={y + 5} fontSize="12" textAnchor="end" fill="#6b7280">
                {Math.round(((percent / 100) * maxValue) / 0)}M
              </text>
            </g>
          )
        })}

        {/* Axe X */}
        <line x1="50" y1="350" x2="950" y2="350" stroke="#9ca3af" strokeWidth="1" />

        {/* Barres et étiquettes */}
        {data.map((item, index) => {
          const x = 50 + index * (barWidth * 3) * 10 // Position X pour chaque groupe de barres
          const inflowHeight = (item.inflow / maxValue) * 350
          const outflowHeight = (item.outflow / maxValue) * 350
          const netFlow = item.inflow - item.outflow

          return (
            <g key={item.month}>
              {/* Barre d'entrée */}
              <rect
                x={x}
                y={350 - inflowHeight}
                width={barWidth * 10}
                height={inflowHeight}
                fill="#10b981"
                rx="2"
                ry="2"
              />

              {/* Barre de sortie */}
              <rect
                x={x + barWidth * 10 + 5}
                y={350 - outflowHeight}
                width={barWidth * 10}
                height={outflowHeight}
                fill="#ef4444"
                rx="2"
                ry="2"
              />

              {/* Étiquette du mois */}
              <text x={x + barWidth * 10} y="370" fontSize="12" textAnchor="middle" fill="#6b7280">
                {item.month}
              </text>

              {/* Flux net */}
              <text
                x={x + barWidth * 10}
                y="390"
                fontSize="10"
                textAnchor="middle"
                fill={netFlow >= 0 ? "#10b981" : "#ef4444"}
              >
                {netFlow >= 0 ? "+" : ""}
                {(netFlow / 0).toFixed(1)}M
              </text>
            </g>
          )
        })}

        {/* Légende */}
        <g transform="translate(800, 30)">
          <rect x="0" y="0" width="15" height="15" fill="#10b981" rx="2" ry="2" />
          <text x="20" y="12" fontSize="12" fill="#6b7280">
            Entrées
          </text>

          <rect x="0" y="25" width="15" height="15" fill="#ef4444" rx="2" ry="2" />
          <text x="20" y="37" fontSize="12" fill="#6b7280">
            Sorties
          </text>
        </g>
      </svg>
    </div>
  )
}
