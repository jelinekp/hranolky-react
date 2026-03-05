/**
 * useChartDataTransform Hook
 * 
 * Manages chart data transformation with animation support.
 * Extracted from VolumeInTimeChart following SoS principle.
 */

import { useState, useEffect, useMemo } from 'react';
import { VolumeDataPoint, getCurrentWeekLabel } from 'hranolky-firestore-common';

interface AnimatedDataPoint extends VolumeDataPoint {
  _animKey?: number;
}

export interface ChartDataTransformResult {
  displayData: VolumeDataPoint[];
  animatedData: AnimatedDataPoint[];
  pulseOpacity: number;
}

/**
 * Generate mock data for loading state
 */
function generateMockVolumeData(): VolumeDataPoint[] {
  const weeks = [];
  const currentDate = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i * 7);
    const weekNum = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
    weeks.push({
      week: `${date.getFullYear()}_${String(weekNum).padStart(2, '0')}`,
      volume: 30 + Math.random() * 40
    });
  }
  return weeks;
}

/**
 * Hook for managing chart data transformation with loading animation
 */
export function useChartDataTransform(
  volumeData: VolumeDataPoint[],
  currentVolume: number,
  loading: boolean
): ChartDataTransformResult {
  const [displayData, setDisplayData] = useState<VolumeDataPoint[]>(() => generateMockVolumeData());
  const [pulseOpacity, setPulseOpacity] = useState(1);
  const [goofyOffsets, setGoofyOffsets] = useState<number[]>([]);

  // Update display data when real data loads
  useEffect(() => {
    if (!loading && volumeData.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayData(volumeData);
    } else if (loading && volumeData.length > 0) {
      setDisplayData(volumeData);
    }
  }, [loading, volumeData]);

  // Animation effect when loading
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setPulseOpacity(() => 0.65 + Math.sin(Date.now() / 200) * 0.35);

        setGoofyOffsets(displayData.map((point, index) => {
          const time = Date.now() / 300;
          const offset = Math.sin(time + index * 0.5) * Math.cos(time * 0.7 + index * 0.3);
          return offset * (point.volume || 50) * 0.15;
        }));
      }, 50);

      return () => clearInterval(interval);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPulseOpacity(1);
      setGoofyOffsets([]);
    }
  }, [loading, displayData]);

  // Build animated data with current volume appended
  const animatedData = useMemo(() => {
    let baseData: AnimatedDataPoint[] = displayData;

    if (loading && goofyOffsets.length > 0) {
      baseData = displayData.map((point, index) => ({
        week: point.week,
        volume: Math.max(0, point.volume + (goofyOffsets[index] || 0)),
        // Use offset value as key — it changes every animation frame
        _animKey: (goofyOffsets[index] || 0) * 10000 + index
      }));
    }

    const currentWeekLabel = getCurrentWeekLabel();
    const filteredBaseData = baseData.filter(d => d.week !== currentWeekLabel);

    return [...filteredBaseData, { week: currentWeekLabel, volume: currentVolume }];
  }, [displayData, loading, goofyOffsets, currentVolume]);

  return {
    displayData,
    animatedData,
    pulseOpacity
  };
}

export { generateMockVolumeData };
