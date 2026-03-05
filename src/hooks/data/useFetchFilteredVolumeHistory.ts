// src/hooks/useFetchFilteredVolumeHistory.ts
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import {
  SlotType,
  VolumeDataPoint,
  WeeklyReport,
  SlotWeeklyReport,
  getWeeklyReportsPath,
  getSlotCollectionName,
  formatWeekId,
  getWeekValue,
  getCurrentWeekLabel
} from "hranolky-firestore-common";

// Helper to advance a 2-digit year + week by one week, handling year rollover
function advanceWeek(y: number, w: number): { y: number; w: number } {
  w++;
  if (w > 52) {
    const year4Digit = 2000 + y;
    const dec31 = new Date(Date.UTC(year4Digit, 11, 31));
    const dayNum = dec31.getUTCDay() || 7;
    // If Dec 31 is Thu, Fri, Sat or Sun, there's a week 53
    const hasWeek53 = dayNum >= 4;

    if (w > (hasWeek53 ? 53 : 52)) {
      w = 1;
      y = (y + 1) % 100;
    }
  }
  return { y, w };
}

// Helper to fill GAPS between recorded weeks by carrying forward the last volume.
// If extendToWeek is provided (e.g. current week label), the last data point's
// volume is also carried forward up to that week, ensuring complete coverage.
function fillHistoricalGaps(data: VolumeDataPoint[], extendToWeek?: string): VolumeDataPoint[] {
  if (data.length === 0) return data;
  if (data.length === 1 && !extendToWeek) return data;

  const result: VolumeDataPoint[] = [];

  // Fill gaps between consecutive data points
  for (let i = 0; i < data.length - 1; i++) {
    result.push(data[i]);

    let [y, w] = data[i].week.split('_').map(Number);
    const targetValue = getWeekValue(data[i + 1].week);

    if (isNaN(y) || isNaN(w)) continue;

    // Safety counter to prevent infinite loops (max 3 years of gaps)
    let safety = 0;
    while (safety < 160) {
      safety++;

      ({ y, w } = advanceWeek(y, w));

      const currentLabel = formatWeekId(y, w);
      if (getWeekValue(currentLabel) >= targetValue) break;

      result.push({
        week: currentLabel,
        volume: data[i].volume
      });
    }
  }

  // Add the last actual data point
  const lastPoint = data[data.length - 1];
  result.push(lastPoint);

  // Extend the last data point forward to extendToWeek (e.g. current week)
  if (extendToWeek) {
    const extendToValue = getWeekValue(extendToWeek);
    let [y, w] = lastPoint.week.split('_').map(Number);

    if (!isNaN(y) && !isNaN(w)) {
      let safety = 0;
      while (safety < 160) {
        safety++;

        ({ y, w } = advanceWeek(y, w));

        const currentLabel = formatWeekId(y, w);
        if (getWeekValue(currentLabel) > extendToValue) break;

        result.push({
          week: currentLabel,
          volume: lastPoint.volume
        });
      }
    }
  }

  return result;
}

export const useFetchFilteredVolumeHistory = (
  slotType: SlotType,
  filteredSlotIds: string[],
  hasActiveFilters: boolean,
  weeksToShow: number = 12
) => {
  const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Create a stable cache key based on filtered slot IDs
  const cacheKey = useMemo(() => {
    if (!hasActiveFilters) return 'aggregate';
    return filteredSlotIds.sort().join(',');
  }, [hasActiveFilters, filteredSlotIds]);

  useEffect(() => {
    let isCancelled = false;

    const fetchVolumeHistory = async () => {
      // Only skip when filters are active and no slots are selected
      if (hasActiveFilters && filteredSlotIds.length === 0) {
        // console.log('⏹️  Skipping fetch - filters active but no slots provided');
        setLoading(false);
        return;
      }

      // console.log('🔍 useFetchFilteredVolumeHistory: Starting fetch...');
      setLoading(true);

      try {
        if (!hasActiveFilters) {
          // Use aggregate reports when no filters
          await fetchAggregateReports(slotType, weeksToShow, () => isCancelled);
        } else {
          // Use per-slot reports when filters are active
          await fetchPerSlotReports(slotType, filteredSlotIds, weeksToShow, () => isCancelled);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('❌ Error fetching volume history:', error);
          setVolumeData([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    const fetchAggregateReports = async (type: SlotType, weeks: number, checkCancelled: () => boolean) => {
      if (checkCancelled()) {
        // console.log('⏹️  Aggregate fetch cancelled before starting');
        return;
      }

      // console.log('   Using aggregate reports (no filters)');

      // Using shared collection path utility
      const collectionSegments = getWeeklyReportsPath(type);

      const reportsRef = collection(db, collectionSegments.join('/'));
      const snapshot = await getDocs(reportsRef);

      if (checkCancelled()) {
        // console.log('⏹️  Aggregate fetch cancelled after getDocs');
        return;
      }

      // Sort documents by ID to ensure chronological order
      const sortedDocs = snapshot.docs.sort((a, b) => a.id.localeCompare(b.id));

      const data: VolumeDataPoint[] = sortedDocs
        .map(doc => {
          const weekId = doc.id;
          const reportData = doc.data() as WeeklyReport;

          // Keep year_week format for proper chronological ordering
          const [year, week] = weekId.split('_');
          const weekLabel = `${year}_${week}`;
          const volumeInM3 = reportData.totalVolumeDm / 1000;

          return {
            week: weekLabel,
            volume: parseFloat(volumeInM3.toFixed(3))
          };
        });

      // Fill gaps in chronology
      const filledData = fillHistoricalGaps(data);

      // Take last N weeks
      const finalData = filledData.slice(-weeks);

      if (checkCancelled()) {
        // console.log('⏹️  Aggregate fetch cancelled before setting state');
        return;
      }

      // console.log('✅ Aggregate data loaded:', finalData.length, 'weeks (filled)');
      setVolumeData(finalData);
    };

    const fetchPerSlotReports = async (slotType: SlotType, slotIds: string[], weeks: number, checkCancelled: () => boolean) => {
      if (checkCancelled()) {
        // console.log('⏹️  Per-slot fetch cancelled before starting');
        return;
      }

      // console.log('   Using per-slot reports (filters active)');

      // Collect all per-slot data with filled weeks
      const allSlotData: Map<string, VolumeDataPoint[]> = new Map();

      // Fetch SlotWeeklyReport for each filtered slot
      for (const slotId of slotIds) {
        if (checkCancelled()) {
          // console.log('⏹️  Per-slot fetch cancelled during slot iteration');
          return;
        }

        // Using shared collection name utility
        const collectionName = getSlotCollectionName(slotType);

        const primaryRef = collection(db, collectionName, slotId, 'SlotWeeklyReport');

        try {
          const snapshot = await getDocs(primaryRef);

          if (checkCancelled()) {
            // console.log('⏹️  Per-slot fetch cancelled after slot getDocs');
            return;
          }

          // Convert this slot's data to VolumeDataPoint array
          const slotDataOriginal: VolumeDataPoint[] = snapshot.docs.map(doc => {
            const weekId = doc.id; // YYYY_WW or YY_WW expected
            const reportData = doc.data() as SlotWeeklyReport;

            // Keep year_week format for proper chronological ordering
            const [year, week] = weekId.split('_');
            const weekLabel = `${year}_${week}`;

            return {
              week: weekLabel,
              volume: reportData.volumeDm / 1000 // Convert to m³
            };
          }).sort((a, b) => a.week.localeCompare(b.week)); // Sort chronologically

          // Fill gaps for this slot locally and extend to current week to ensure
          // carry-forward works correctly per slot across year boundaries
          const currentWeek = getCurrentWeekLabel();
          const slotData = fillHistoricalGaps(slotDataOriginal, currentWeek);

          allSlotData.set(slotId, slotData);
        } catch (error) {
          if (!checkCancelled()) {
            console.warn(`   Failed to fetch reports for slot ${slotId}:`, error);
          }
        }
      }

      if (checkCancelled()) {
        // console.log('⏹️  Per-slot fetch cancelled before aggregation');
        return;
      }

      // console.log(`   Loaded data for ${allSlotData.size} slots`);

      // Now aggregate across all slots per week (using year_week as key)
      const weeklyAggregates = new Map<string, number>();

      // For each slot's data, add to the weekly aggregates
      for (const [, slotData] of allSlotData.entries()) {
        for (const dataPoint of slotData) {
          const currentVolume = weeklyAggregates.get(dataPoint.week) || 0;
          weeklyAggregates.set(dataPoint.week, currentVolume + dataPoint.volume);
        }
      }

      // console.log(`   Aggregated ${weeklyAggregates.size} weeks of data`);

      // Convert to sorted array (sort by year_week string for chronological order)
      const sortedData = Array.from(weeklyAggregates.entries())
        .sort((a, b) => a[0].localeCompare(b[0])) // Sort by year_week string
        .map(([weekLabel, volume]) => ({
          week: weekLabel,
          volume: parseFloat(volume.toFixed(3))
        }));

      // Take last N weeks
      const finalData = sortedData.slice(-weeks);

      if (checkCancelled()) {
        // console.log('⏹️  Per-slot fetch cancelled before setting state');
        return;
      }

      // console.log('✅ Per-slot data aggregated:', finalData.length, 'weeks');
      setVolumeData(finalData);
    };

    fetchVolumeHistory();

    // Cleanup function to cancel ongoing fetch when filters change
    return () => {
      isCancelled = true;
      // console.log('🛑 Fetch operation cancelled (filters changed or component unmounted)');
    };
  }, [slotType, cacheKey, hasActiveFilters, filteredSlotIds, weeksToShow]);

  return { volumeData, loading };
};
