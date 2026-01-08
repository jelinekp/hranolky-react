// src/hooks/useFetchFilteredVolumeHistory.ts
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { SlotType } from "hranolky-firestore-common";

interface VolumeDataPoint {
  week: string;
  volume: number;
}

interface WeeklyReport {
  totalQuantity: number;
  totalVolumeDm: number;
}

interface SlotWeeklyReport {
  quantity: number;
  volumeDm: number;
}

// Helper to fill GAPS between recorded weeks by carrying forward the last volume
function fillHistoricalGaps(data: VolumeDataPoint[]): VolumeDataPoint[] {
  if (data.length < 2) return data;

  const result: VolumeDataPoint[] = [];

  // Helper to get a comparable value for a week label "YY_WW"
  const getWeekValue = (label: string) => {
    const parts = label.split('_');
    if (parts.length < 2) return 0;
    const y = parseInt(parts[0]);
    const w = parseInt(parts[1]);
    return y * 100 + w;
  };

  // Helper to get the canonical label from year and week
  const getLabel = (y: number, w: number) =>
    `${y.toString().padStart(2, '0')}_${w.toString().padStart(2, '0')}`;

  for (let i = 0; i < data.length - 1; i++) {
    result.push(data[i]);

    let [y, w] = data[i].week.split('_').map(Number);
    const targetValue = getWeekValue(data[i + 1].week);

    if (isNaN(y) || isNaN(w)) continue;

    // Safety counter to prevent infinite loops (max 3 year of gaps)
    let safety = 0;
    while (safety < 160) {
      safety++;

      // Advance to next week
      w++;
      if (w > 52) {
        // Simple check for week 53 vs week 1 of next year
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

      const currentLabel = getLabel(y, w);
      if (getWeekValue(currentLabel) >= targetValue) break;

      result.push({
        week: currentLabel,
        volume: data[i].volume
      });
    }
  }

  result.push(data[data.length - 1]);
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

      // Updated to new nested collection paths
      const collectionSegments = type === SlotType.Beam
        ? ['WeeklyReports', 'Hranolky', 'WeeklyData']
        : ['WeeklyReports', 'Sparovky', 'WeeklyData'];

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

        // Determine collection and document ID based on slot type
        let collectionName: string;

        if (slotType === SlotType.Beam) {
          collectionName = 'Hranolky';
        } else if (slotType === SlotType.Jointer) {
          collectionName = 'Sparovky';
        } else {
          // DUB- or other prefixes go to Hranolky without stripping
          collectionName = 'Hranolky';
        }

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

          // Fill gaps for this slot locally to ensure carry-forward works correctly per slot
          const slotData = fillHistoricalGaps(slotDataOriginal);

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
