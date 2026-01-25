/**
 * Chart Axis Utilities
 * 
 * Pure functions for chart axis calculations following SoC principle.
 * Extracted from VolumeInTimeChart to enable independent testing and reuse.
 */

import { VolumeDataPoint } from 'hranolky-firestore-common';

export interface YAxisConfig {
  yDomain: [number, number];
  yTicks: number[];
}

/**
 * Calculate Y-axis domain and ticks based on data
 * Uses adaptive step calculation for clean tick values
 */
export function calculateYAxisConfig(data: VolumeDataPoint[]): YAxisConfig {
  if (data.length === 0) {
    return {
      yDomain: [0, 100],
      yTicks: [0, 25, 50, 75, 100]
    };
  }

  const maxValue = Math.max(...data.map(d => d.volume));
  const paddedMax = maxValue * 1.02; // 2% padding

  // Adaptive step calculation
  let step = 1;
  if (paddedMax <= 10) step = 1;
  else if (paddedMax <= 40) step = 5;
  else if (paddedMax <= 100) step = 10;
  else step = 25;

  const numSteps = Math.ceil(paddedMax / step);
  const actualMax = numSteps * step;
  const ticks = Array.from({ length: numSteps + 1 }, (_, i) => i * step);

  return {
    yDomain: [0, actualMax],
    yTicks: ticks
  };
}

/**
 * Determine if a week is an inventory check week
 */
export function isInventoryCheckWeek(weekLabel: string, checkWeeks: readonly number[]): boolean {
  const weekNum = parseInt(weekLabel.split('_')[1] || weekLabel);
  return checkWeeks.includes(weekNum as typeof checkWeeks[number]);
}

/**
 * Filter data to only inventory check weeks
 */
export function filterInventoryCheckWeeks(
  data: VolumeDataPoint[],
  checkWeeks: readonly number[]
): string[] {
  return data
    .filter(d => isInventoryCheckWeek(d.week, checkWeeks))
    .map(d => d.week);
}
