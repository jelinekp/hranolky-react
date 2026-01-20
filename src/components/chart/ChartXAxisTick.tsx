/**
 * Chart X-Axis Tick Component
 * 
 * Extracted from VolumeInTimeChart.tsx following the Separation of Concerns (SoC) 
 * principle from Normalized Systems theory. Handles custom X-axis tick rendering
 * with two-row display (week number + year grouping).
 */

import React from 'react'

interface VolumeDataPoint {
  week: string
  volume: number
}

export interface ChartXAxisTickProps {
  x?: number
  y?: number
  payload?: { value: string }
  index?: number
  /** Full data array for calculating year boundaries */
  data: VolumeDataPoint[]
}

/**
 * Custom X-axis tick component with two rows:
 * - Top row: Week number
 * - Bottom row: Year label (only at year boundaries)
 * Includes a connecting line between year groups.
 */
const ChartXAxisTick: React.FC<ChartXAxisTickProps> = ({ x, y, payload, index, data }) => {
  if (!payload || x === undefined || y === undefined || index === undefined) return null

  const weekStr = payload.value
  const parts = weekStr.split('_')
  const year = parts[0] || ''
  const weekNum = parts[1] || weekStr

  // Check if this is the first tick of a new year or the first tick overall
  const prevWeek = index > 0 ? data[index - 1]?.week : null
  const prevYear = prevWeek ? prevWeek.split('_')[0] : null
  const isFirstOfYear = index === 0 || year !== prevYear

  // Check if next tick is a different year (to know where year group ends)
  const nextWeek = index < data.length - 1 ? data[index + 1]?.week : null
  const nextYear = nextWeek ? nextWeek.split('_')[0] : null
  const isLastOfYear = index === data.length - 1 || year !== nextYear

  // Show week label every 2 weeks, at year boundaries, or at last item
  const showWeekLabel = isFirstOfYear || isLastOfYear || (index % 2 === 0)

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Week number on top - black for visibility */}
      {showWeekLabel && (
        <text
          x={0}
          y={0}
          dy={12}
          textAnchor="middle"
          fill="#333333"
          fontSize={10}
          fontWeight="500"
        >
          {weekNum}
        </text>
      )}

      {/* Year label - only show at the start of each year group */}
      {isFirstOfYear && (
        <text
          x={2}
          y={0}
          dy={32}
          textAnchor="start"
          fill="var(--color-text-03)"
          fontSize={10}
          fontWeight="bold"
        >
          {year.length === 2 ? `20${year}` : year}
        </text>
      )}

      {/* Year grouping line - solid by increasing overlap */}
      <line
        x1={isFirstOfYear ? 0 : -50}
        y1={20}
        x2={isLastOfYear ? 0 : 50}
        y2={20}
        stroke="var(--color-text-03)"
        strokeWidth={1.5}
      />
    </g>
  )
}

export default ChartXAxisTick
