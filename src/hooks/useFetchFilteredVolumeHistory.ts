// src/hooks/useFetchFilteredVolumeHistory.ts
import {useEffect, useMemo, useState} from "react";
import {collection, getDocs} from "firebase/firestore";
import {db} from "../firebase";
import {SlotType} from "hranolky-firestore-common";

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

// Helper function to get current week number (ISO 8601)
function getCurrentWeekNumber(): number {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

// Helper function to fill missing weeks with previous week's value
function fillMissingWeeks(data: VolumeDataPoint[]): VolumeDataPoint[] {
  if (data.length === 0) return data;

  // Extract week numbers from labels (e.g., "W27" or "27" -> 27)
  const weeksWithData = data.map(d => ({
    weekNumber: parseInt(d.week),
    volume: d.volume
  }));

  // Find min week from data
  const minWeek = Math.min(...weeksWithData.map(w => w.weekNumber));

  // Max week is always the previous week (last Sunday)
  const currentWeek = getCurrentWeekNumber();
  const maxWeek = currentWeek - 1;

  // Create a map for quick lookup
  const weekMap = new Map(weeksWithData.map(w => [w.weekNumber, w.volume]));

  // Fill in all weeks from min to max
  const filledData: VolumeDataPoint[] = [];
  let lastVolume = 0;

  for (let week = minWeek; week <= maxWeek; week++) {
    const volume = weekMap.get(week);

    if (volume !== undefined) {
      // Week exists in data, use it
      lastVolume = volume;
    }
    // else: Week is missing, use lastVolume (carries forward from previous week)

    filledData.push({
      week: `${week}`,
      volume: lastVolume
    });
  }

  return filledData;
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
        console.log('⏹️  Skipping fetch - filters active but no slots provided');
        setLoading(false);
        return;
      }

      console.log('🔍 useFetchFilteredVolumeHistory: Starting fetch...');
      console.log('   SlotType:', slotType);
      console.log('   Has Active Filters:', hasActiveFilters);
      console.log('   Filtered Slots Count:', filteredSlotIds.length);

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
        console.log('⏹️  Aggregate fetch cancelled before starting');
        return;
      }

      console.log('   Using aggregate reports (no filters)');

      // Updated to new nested collection paths
      const collectionSegments = type === SlotType.Beam
        ? ['WeeklyReports', 'Hranolky', 'WeeklyData']
        : ['WeeklyReports', 'Sparovky', 'WeeklyData'];

      const reportsRef = collection(db, collectionSegments.join('/'));
      const snapshot = await getDocs(reportsRef);

      if (checkCancelled()) {
        console.log('⏹️  Aggregate fetch cancelled after getDocs');
        return;
      }

      console.log(`   Found ${snapshot.size} aggregate reports`);

      // Sort documents by ID to ensure chronological order
      const sortedDocs = snapshot.docs.sort((a, b) => a.id.localeCompare(b.id));

      const data: VolumeDataPoint[] = sortedDocs
        .map(doc => {
          const weekId = doc.id;
          const reportData = doc.data() as WeeklyReport;

          const week = weekId.split('_')[1];
          const weekNumber = parseInt(week, 10);
          const volumeInM3 = reportData.totalVolumeDm / 1000;

          return {
            week: weekNumber.toString(),
            volume: parseFloat(volumeInM3.toFixed(3))
          };
        });

      // Fill missing weeks to create continuous data
      const filledData = fillMissingWeeks(data);

      // Take last N weeks after filling
      const finalData = filledData.slice(-weeks);

      if (checkCancelled()) {
        console.log('⏹️  Aggregate fetch cancelled before setting state');
        return;
      }

      console.log('✅ Aggregate data loaded:', finalData.length, 'weeks (filled)');
      setVolumeData(finalData);
    };

    const fetchPerSlotReports = async (slotType: SlotType, slotIds: string[], weeks: number, checkCancelled: () => boolean) => {
      if (checkCancelled()) {
        console.log('⏹️  Per-slot fetch cancelled before starting');
        return;
      }

      console.log('   Using per-slot reports (filters active)');

      // Collect all per-slot data with filled weeks
      const allSlotData: Map<string, VolumeDataPoint[]> = new Map();

      // Fetch SlotWeeklyReport for each filtered slot
      for (const slotId of slotIds) {
        if (checkCancelled()) {
          console.log('⏹️  Per-slot fetch cancelled during slot iteration');
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
          // If primary succeeded but returned no docs, try fallback
          if (snapshot.empty) {
            console.log(`   No docs under SlotWeeklyReport, trying SlotWeeklyReports at ${collectionName}/${slotId}...`);
          }


          if (checkCancelled()) {
            console.log('⏹️  Per-slot fetch cancelled after slot getDocs');
            return;
          }

          // Convert this slot's data to VolumeDataPoint array
          const slotData: VolumeDataPoint[] = snapshot.docs.map(doc => {
            const weekId = doc.id; // YY_WW expected
            const reportData = doc.data() as SlotWeeklyReport;

            const week = weekId.split('_')[1];
            const weekNumber = parseInt(week, 10);

            return {
              week: `${weekNumber}`,
              volume: reportData.volumeDm / 1000 // Convert to m³
            };
          }).sort((a, b) => parseInt(a.week) - parseInt(b.week));
          // Fill missing weeks for THIS slot
          const filledSlotData = fillMissingWeeks(slotData);

          allSlotData.set(slotId, filledSlotData);
        } catch (error) {
          if (!checkCancelled()) {
            console.warn(`   Failed to fetch reports for slot ${slotId}:`, error);
          }
        }
      }

      if (checkCancelled()) {
        console.log('⏹️  Per-slot fetch cancelled before aggregation');
        return;
      }

      console.log(`   Loaded data for ${allSlotData.size} slots`);

      // Now aggregate across all slots per week
      const weeklyAggregates = new Map<number, number>();

      // For each slot's filled data, add to the weekly aggregates
      for (const [, slotData] of allSlotData.entries()) {
        for (const dataPoint of slotData) {
          const weekNumber = parseInt(dataPoint.week);
          const currentVolume = weeklyAggregates.get(weekNumber) || 0;
          weeklyAggregates.set(weekNumber, currentVolume + dataPoint.volume);
        }
      }

      console.log(`   Aggregated ${weeklyAggregates.size} weeks of data`);

      // Convert to sorted array
      const sortedData = Array.from(weeklyAggregates.entries())
        .sort((a, b) => a[0] - b[0]) // Sort by week number
        .map(([weekNumber, volume]) => ({
          week: `${weekNumber}`,
          volume: parseFloat(volume.toFixed(3))
        }));

      // Take last N weeks
      const finalData = sortedData.slice(-weeks);

      if (checkCancelled()) {
        console.log('⏹️  Per-slot fetch cancelled before setting state');
        return;
      }

      console.log('✅ Per-slot data aggregated:', finalData.length, 'weeks');
      setVolumeData(finalData);
    };

    fetchVolumeHistory();

    // Cleanup function to cancel ongoing fetch when filters change
    return () => {
      isCancelled = true;
      console.log('🛑 Fetch operation cancelled (filters changed or component unmounted)');
    };
  }, [slotType, cacheKey, hasActiveFilters, filteredSlotIds, weeksToShow]);

  return {volumeData, loading};
};
