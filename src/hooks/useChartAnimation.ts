/**
 * Chart Animation Hook
 * 
 * Extracted from VolumeInTimeChart.tsx following the Separation of Concerns (SoC) 
 * principle from Normalized Systems theory. This hook handles the pulsing/goofy
 * animation logic for loading states, keeping the chart component focused on rendering.
 */

import { useState, useEffect } from 'react'

interface VolumeDataPoint {
  week: string
  volume: number
}

interface ChartAnimationState {
  /** Current opacity for pulse animation (0-1) */
  pulseOpacity: number
  /** Array of offsets for each data point's "goofy" bounce effect */
  goofyOffsets: number[]
  /** Display data with animation offsets applied */
  animatedData: VolumeDataPoint[]
}

/**
 * Hook that manages chart loading animation state.
 * Creates a pulsing opacity effect and per-point bounce offsets.
 * 
 * @param isLoading - Whether data is currently loading
 * @param displayData - The current display data points
 * @returns Animation state including opacity and offsets
 */
export function useChartAnimation(
  isLoading: boolean,
  displayData: VolumeDataPoint[]
): ChartAnimationState {
  const [pulseOpacity, setPulseOpacity] = useState(1)
  const [goofyOffsets, setGoofyOffsets] = useState<number[]>([])

  // Goofy pulsing animation effect when loading - each point bounces differently!
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setPulseOpacity(() => {
          // Overall opacity pulse between 0.3 and 1
          return 0.65 + Math.sin(Date.now() / 200) * 0.35
        })

        // Each data point gets a random-ish offset for goofy up/down bouncing
        setGoofyOffsets(displayData.map((dataPoint, index) => {
          // Different frequency for each point based on index
          const time = Date.now() / 300
          const offset = Math.sin(time + index * 0.5) * Math.cos(time * 0.7 + index * 0.3)
          // Scale to make a subtle wavy effect (max 15% variation)
          const baseValue = dataPoint.volume || 50
          return offset * baseValue * 0.15 // Max 15% up or down
        }))
      }, 50) // Update every 50ms for smooth goofy animation

      return () => clearInterval(interval)
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPulseOpacity(1)
      setGoofyOffsets([])
    }
  }, [isLoading, displayData])

  // Calculate animated data with offsets applied
  const animatedData = displayData.map((point, index) => ({
    ...point,
    volume: point.volume + (goofyOffsets[index] || 0)
  }))

  return {
    pulseOpacity,
    goofyOffsets,
    animatedData
  }
}
