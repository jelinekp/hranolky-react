/**
 * CSV Export utility for exporting filtered warehouse slots with weekly quantities
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { WarehouseSlotClass, SlotType } from 'hranolky-firestore-common';

interface SlotWeeklyReport {
  quantity: number;
  volumeDm: number;
}

// Helper function to get current week number
function getCurrentWeekNumber(): { year: number; week: number } {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

// Get all week IDs from a starting week to current
function getAllWeekIds(startYear: number, startWeek: number): string[] {
  const current = getCurrentWeekNumber();
  const weeks: string[] = [];

  let year = startYear;
  let week = startWeek;

  while (year < current.year || (year === current.year && week <= current.week)) {
    const yearStr = String(year % 100).padStart(2, '0');
    const weekStr = String(week).padStart(2, '0');
    weeks.push(`${yearStr}_${weekStr}`);

    week++;
    // Handle year rollover (max 52 or 53 weeks per year)
    if (week > 52) {
      week = 1;
      year++;
    }
  }

  return weeks;
}

// Fetch weekly reports for a single slot
async function fetchSlotWeeklyReports(
  collectionName: string,
  slotId: string
): Promise<Map<string, number>> {
  const reports = new Map<string, number>();

  try {
    const reportsRef = collection(db, collectionName, slotId, 'SlotWeeklyReport');
    const snapshot = await getDocs(reportsRef);

    snapshot.docs.forEach(doc => {
      const data = doc.data() as SlotWeeklyReport;
      reports.set(doc.id, data.quantity);
    });
  } catch (error) {
    console.warn(`Failed to fetch reports for ${collectionName}/${slotId}:`, error);
  }

  return reports;
}

// Fill missing weeks with forward-fill (impute from last available value)
function fillMissingWeeks(
  weeklyData: Map<string, number>,
  allWeeks: string[]
): Map<string, number> {
  const filled = new Map<string, number>();
  let lastValue = 0;

  for (const week of allWeeks) {
    const value = weeklyData.get(week);
    if (value !== undefined) {
      lastValue = value;
    }
    filled.set(week, lastValue);
  }

  return filled;
}

function buildSlotExportQuantities(
  slot: WarehouseSlotClass,
  weeklyDataMap: Map<string, Map<string, number>>,
  allWeeks: string[]
): number[] {
  const slotWeeklyData = weeklyDataMap.get(slot.productId) || new Map();
  const filledData = fillMissingWeeks(slotWeeklyData, allWeeks);
  const quantities = allWeeks.map(week => filledData.get(week) || 0);

  // Mirror the chart behavior: the current week endpoint uses the live slot quantity.
  if (quantities.length > 0) {
    quantities[quantities.length - 1] = slot.quantity;
  }

  return quantities;
}

// Generate CSV content
function generateCsvContent(
  slots: WarehouseSlotClass[],
  weeklyDataMap: Map<string, Map<string, number>>,
  allWeeks: string[]
): string {
  // Header row
  const header = ['slotId', ...allWeeks].join(',');

  // Data rows
  const rows = slots.map(slot => {
    const quantities = buildSlotExportQuantities(slot, weeklyDataMap, allWeeks);
    return [slot.productId, ...quantities].join(',');
  });

  return [header, ...rows].join('\n');
}

// Trigger browser download
function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export filtered slots to CSV with weekly quantities
 * @param filteredSlots - Array of filtered warehouse slots to export
 * @param slotType - Type of slots (Beam/Jointer) to determine collection
 * @param onProgress - Optional callback for progress updates (0-100)
 */
export async function exportSlotsToCsv(
  filteredSlots: WarehouseSlotClass[],
  slotType: SlotType,
  onProgress?: (progress: number, status: string) => void
): Promise<void> {
  if (filteredSlots.length === 0) {
    throw new Error('No slots to export');
  }

  onProgress?.(0, 'Preparing export...');

  // Determine collection name
  const collectionName = slotType === SlotType.Beam ? 'Hranolky' : 'Sparovky';

  // Determine starting week based on slot type
  const startYear = 2025;
  const startWeek = slotType === SlotType.Beam ? 27 : 45;

  // Get all week IDs
  const allWeeks = getAllWeekIds(startYear, startWeek);

  onProgress?.(5, `Fetching data for ${filteredSlots.length} slots...`);

  // Fetch weekly reports for each slot
  const weeklyDataMap = new Map<string, Map<string, number>>();

  for (let i = 0; i < filteredSlots.length; i++) {
    const slot = filteredSlots[i];
    const progress = 5 + Math.round((i / filteredSlots.length) * 85);
    onProgress?.(progress, `Fetching ${slot.productId}...`);

    const reports = await fetchSlotWeeklyReports(collectionName, slot.productId);
    weeklyDataMap.set(slot.productId, reports);
  }

  onProgress?.(90, 'Generating CSV...');

  // Generate CSV content
  const csvContent = generateCsvContent(filteredSlots, weeklyDataMap, allWeeks);

  onProgress?.(95, 'Downloading...');

  // Create filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${collectionName}_export_${timestamp}.csv`;

  // Trigger download
  downloadCsv(csvContent, filename);

  onProgress?.(100, 'Export complete!');
}

// Generate TSV content (tab-separated for Excel paste)
function generateTsvContent(
  slots: WarehouseSlotClass[],
  weeklyDataMap: Map<string, Map<string, number>>,
  allWeeks: string[]
): string {
  // Header row
  const header = ['slotId', ...allWeeks].join('\t');

  // Data rows
  const rows = slots.map(slot => {
    const quantities = buildSlotExportQuantities(slot, weeklyDataMap, allWeeks);
    return [slot.productId, ...quantities].join('\t');
  });

  return [header, ...rows].join('\n');
}

/**
 * Copy filtered slots to clipboard as tab-separated table (for Excel paste)
 * @param filteredSlots - Array of filtered warehouse slots to export
 * @param slotType - Type of slots (Beam/Jointer) to determine collection
 * @param onProgress - Optional callback for progress updates (0-100)
 */
export async function copySlotsToClipboard(
  filteredSlots: WarehouseSlotClass[],
  slotType: SlotType,
  onProgress?: (progress: number, status: string) => void
): Promise<void> {
  if (filteredSlots.length === 0) {
    throw new Error('No slots to copy');
  }

  onProgress?.(0, 'Preparing...');

  // Determine collection name
  const collectionName = slotType === SlotType.Beam ? 'Hranolky' : 'Sparovky';

  // Determine starting week based on slot type
  const startYear = 2025;
  const startWeek = slotType === SlotType.Beam ? 27 : 45;

  // Get all week IDs
  const allWeeks = getAllWeekIds(startYear, startWeek);

  onProgress?.(5, `Načítám ${filteredSlots.length} slotů...`);

  // Fetch weekly reports for each slot
  const weeklyDataMap = new Map<string, Map<string, number>>();

  for (let i = 0; i < filteredSlots.length; i++) {
    const slot = filteredSlots[i];
    const progress = 5 + Math.round((i / filteredSlots.length) * 85);
    onProgress?.(progress, `Načítám ${slot.productId}...`);

    const reports = await fetchSlotWeeklyReports(collectionName, slot.productId);
    weeklyDataMap.set(slot.productId, reports);
  }

  onProgress?.(90, 'Generuji tabulku...');

  // Generate TSV content (tab-separated for Excel)
  const tsvContent = generateTsvContent(filteredSlots, weeklyDataMap, allWeeks);

  onProgress?.(95, 'Kopíruji do schránky...');

  // Copy to clipboard
  await navigator.clipboard.writeText(tsvContent);

  onProgress?.(100, 'Zkopírováno!');
}
