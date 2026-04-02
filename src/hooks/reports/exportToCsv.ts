/**
 * Excel export utility for exporting filtered warehouse slots with weekly quantities and volumes
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
    console.warn(`Nepodařilo se vyexportovat data pro položku ${collectionName}/${slotId}:`, error);
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

function calculateSlotVolumeDm(slot: WarehouseSlotClass, quantity: number): number {
  if (!slot.thickness || !slot.width || !slot.length) {
    return 0;
  }

  return Number(((quantity * slot.length * slot.thickness * slot.width) / 1_000_000).toFixed(3));
}

function buildSlotExportVolumes(
  slot: WarehouseSlotClass,
  quantities: number[]
): number[] {
  return quantities.map(quantity => calculateSlotVolumeDm(slot, quantity));
}

function formatExportTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function buildExportHeader(allWeeks: string[], exportTimestampLabel: string): string[] {
  if (allWeeks.length === 0) {
    return ['slotId'];
  }

  return [
    'slotId',
    ...allWeeks.slice(0, -1),
    `Poslední živá data (${exportTimestampLabel})`
  ];
}

function buildSheetRows(
  slots: WarehouseSlotClass[],
  weeklyDataMap: Map<string, Map<string, number>>,
  allWeeks: string[],
  exportTimestampLabel: string,
  valueBuilder: (slot: WarehouseSlotClass, quantities: number[]) => Array<number | string>
): Array<Array<string | number>> {
  const header = buildExportHeader(allWeeks, exportTimestampLabel);

  const rows = slots.map(slot => {
    const quantities = buildSlotExportQuantities(slot, weeklyDataMap, allWeeks);
    return [slot.productId, ...valueBuilder(slot, quantities)];
  });

  return [header, ...rows];
}

async function createWorkbookBlob(
  quantitiesRows: Array<Array<string | number>>,
  volumeRows: Array<Array<string | number>>
): Promise<Blob> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();

  const quantitiesSheet = XLSX.utils.aoa_to_sheet(quantitiesRows);
  const volumeSheet = XLSX.utils.aoa_to_sheet(volumeRows);

  quantitiesSheet['!cols'] = quantitiesRows[0].map((_, index) => ({ wch: index === 0 ? 28 : 18 }));
  volumeSheet['!cols'] = volumeRows[0].map((_, index) => ({ wch: index === 0 ? 28 : 18 }));

  XLSX.utils.book_append_sheet(workbook, quantitiesSheet, 'Kusy');
  XLSX.utils.book_append_sheet(workbook, volumeSheet, 'Objemy dm3');

  const workbookArray = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([workbookArray], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

// Trigger browser download
function downloadFile(blob: Blob, filename: string): void {
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
 * Export filtered slots to Excel with weekly quantities and volumes
 * @param filteredSlots - Array of filtered warehouse slots to export
 * @param slotType - Type of slots (Beam/Jointer) to determine collection
 * @param onProgress - Optional callback for progress updates (0-100)
 */
export async function exportSlotsToExcel(
  filteredSlots: WarehouseSlotClass[],
  slotType: SlotType,
  onProgress?: (progress: number, status: string) => void
): Promise<void> {
  if (filteredSlots.length === 0) {
    throw new Error('Žádné položky k exportu');
  }

  onProgress?.(0, 'Připravuji export...');

  // Determine collection name
  const collectionName = slotType === SlotType.Beam ? 'Hranolky' : 'Sparovky';

  // Determine starting week based on slot type
  const startYear = 2025;
  const startWeek = slotType === SlotType.Beam ? 27 : 45;

  // Get all week IDs
  const allWeeks = getAllWeekIds(startYear, startWeek);

  onProgress?.(5, `Stahování dat pro ${filteredSlots.length} položek...`);

  // Fetch weekly reports for each slot
  const weeklyDataMap = new Map<string, Map<string, number>>();

  for (let i = 0; i < filteredSlots.length; i++) {
    const slot = filteredSlots[i];
    const progress = 5 + Math.round((i / filteredSlots.length) * 85);
    onProgress?.(progress, `Stahování stavů pro ${slot.productId}...`);

    const reports = await fetchSlotWeeklyReports(collectionName, slot.productId);
    weeklyDataMap.set(slot.productId, reports);
  }

  onProgress?.(90, 'Generování Excelu...');
  const exportDate = new Date();
  const exportTimestampLabel = formatExportTimestamp(exportDate);

  const quantitiesRows = buildSheetRows(
    filteredSlots,
    weeklyDataMap,
    allWeeks,
    exportTimestampLabel,
    (_slot, quantities) => quantities
  );
  const volumeRows = buildSheetRows(
    filteredSlots,
    weeklyDataMap,
    allWeeks,
    exportTimestampLabel,
    (slot, quantities) => buildSlotExportVolumes(slot, quantities)
  );
  const workbookBlob = await createWorkbookBlob(quantitiesRows, volumeRows);

  onProgress?.(95, 'Stahování...');

  // Create filename with timestamp
  const timestamp = exportDate.toISOString().split('T')[0];
  const filename = `${collectionName}_export_${timestamp}.xlsx`;

  // Trigger download
  downloadFile(workbookBlob, filename);

  onProgress?.(100, 'Export dokončen!');
}

// Generate TSV content (tab-separated for Excel paste)
function generateTsvContent(
  slots: WarehouseSlotClass[],
  weeklyDataMap: Map<string, Map<string, number>>,
  allWeeks: string[],
  exportTimestampLabel: string
): string {
  // Header row
  const header = buildExportHeader(allWeeks, exportTimestampLabel).join('\t');

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
    throw new Error('Žádné položky k exportu');
  }

  onProgress?.(0, 'Připravování...');

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
    onProgress?.(progress, `Stahuji stavy pro ${slot.productId}...`);

    const reports = await fetchSlotWeeklyReports(collectionName, slot.productId);
    weeklyDataMap.set(slot.productId, reports);
  }

  onProgress?.(90, 'Generuji tabulku...');
  const exportTimestampLabel = formatExportTimestamp(new Date());

  // Generate TSV content (tab-separated for Excel)
  const tsvContent = generateTsvContent(filteredSlots, weeklyDataMap, allWeeks, exportTimestampLabel);

  onProgress?.(95, 'Kopíruji do schránky...');

  // Copy to clipboard
  await navigator.clipboard.writeText(tsvContent);

  onProgress?.(100, 'Zkopírováno!');
}
