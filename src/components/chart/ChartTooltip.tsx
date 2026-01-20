/**
 * Chart Tooltip Component
 * 
 * Extracted from VolumeInTimeChart.tsx following the Separation of Concerns (SoC) 
 * principle from Normalized Systems theory. Handles tooltip rendering for volume chart.
 */

import React from 'react'

interface VolumeDataPoint {
  week: string
  volume: number
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ payload: VolumeDataPoint; value: number }>
}

/**
 * Custom tooltip for the volume line chart.
 * Displays week number and volume in a styled popup.
 */
const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const weekStr = payload[0].payload.week
    const parts = weekStr.split('_')
    const displayLabel = parts.length === 2 ? `Týden ${parts[1]}/${parts[0]}` : weekStr

    return (
      <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg">
        <p className="font-semibold">{displayLabel}</p>
        <p className="text-[var(--color-primary-light)]">{payload[0].value.toFixed(2)} m³</p>
      </div>
    )
  }
  return null
}

export default ChartTooltip
