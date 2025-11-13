/* Generate weekly reports in Firestore database
   This script populates historical weekly reports for Beams and Jointers
   Run this once to generate all historical data.
 */

import {collection, doc, getDocs, writeBatch, Timestamp} from 'firebase/firestore';
import {db} from '../firebase';
import {WarehouseSlotClass} from "../../common";
import {SlotType} from "../../common/SlotType.ts";

interface SlotAction {
    action: string;
    newQuantity: number;
    quantityChange: number;
    timestamp: Timestamp;
    userId: string;
}

interface SlotData {
    slot: WarehouseSlotClass;
    actions: SlotAction[];
}

interface WeeklyReport {
    totalQuantity: number;
    totalVolumeDm: number;
}

// Helper function to get week number from date
function getWeekNumber(date: Date): { year: number; week: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return {year: d.getUTCFullYear(), week: weekNo};
}

// Helper function to get end of week (Sunday 23:59:59)
function getEndOfWeek(year: number, week: number): Date {
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const monday = new Date(jan4.getTime() + ((week - 1) * 7 - (jan4.getUTCDay() || 7) + 1) * 86400000);
    const sunday = new Date(monday.getTime() + 6 * 86400000);
    sunday.setUTCHours(23, 59, 59, 999);
    return sunday;
}

// Helper function to calculate volume in dm³ (cubic decimeters)
function calculateVolume(slot: WarehouseSlotClass, quantity: number): number {
    if (!slot.thickness || !slot.width || !slot.length) {
        return 0;
    }

    // Convert mm³ to dm³: thickness * width * length (all in mm) * quantity / 1,000,000
    return (quantity * slot.length * slot.thickness * slot.width) / 1_000_000;
}

// Download all warehouse slots and their actions into memory
async function downloadAllData(): Promise<Map<string, SlotData>> {
    console.log('📥 Downloading all warehouse slots and actions into memory...');

    const warehouseSlotsRef = collection(db, 'WarehouseSlots');
    const slotsSnapshot = await getDocs(warehouseSlotsRef);

    console.log(`   Found ${slotsSnapshot.size} warehouse slots`);

    const allData = new Map<string, SlotData>();
    let totalActions = 0;

    for (const slotDoc of slotsSnapshot.docs) {
        const slotId = slotDoc.id;
        const slot = new WarehouseSlotClass(slotId, slotDoc.data()).parsePropertiesFromProductId();

        // Download all actions for this slot
        const slotActionsRef = collection(db, 'WarehouseSlots', slotId, 'SlotActions');
        const actionsSnapshot = await getDocs(slotActionsRef);

        const actions = actionsSnapshot.docs
            .map(doc => doc.data() as SlotAction)
            .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()); // Sort by timestamp ascending

        totalActions += actions.length;

        allData.set(slotId, { slot, actions });
    }

    console.log(`   Downloaded ${totalActions} total actions`);
    console.log('✅ All data loaded into memory!\n');

    return allData;
}

// Get quantity for a slot at a specific point in time (from in-memory data)
function getSlotQuantityAtTime(slotData: SlotData, endTime: Date): number {
    const endTimeMs = endTime.getTime();

    // Find the latest action before or at the end time
    let latestQuantity = 0; // Default to 0 if no actions found

    for (const action of slotData.actions) {
        const actionTimeMs = action.timestamp.toMillis();
        if (actionTimeMs <= endTimeMs) {
            latestQuantity = action.newQuantity;
        } else {
            break; // Actions are sorted, so we can stop here
        }
    }

    return latestQuantity;
}

// Generate reports for all weeks (in memory)
function generateReportsInMemory(
    allData: Map<string, SlotData>,
    startWeek: number,
    endWeek: number,
    year: number,
    slotType: SlotType
): Map<string, WeeklyReport> {
    const reports = new Map<string, WeeklyReport>();

    console.log(`📊 Processing ${slotType === SlotType.Beam ? 'Beam' : 'Jointer'} reports...`);

    for (let week = startWeek; week <= endWeek; week++) {
        const weekId = `${year}_${String(week).padStart(2, '0')}`;
        const endOfWeek = getEndOfWeek(year, week);

        let totalQuantity = 0;
        let totalVolumeDm = 0;

        for (const [slotId, slotData] of allData.entries()) {
            // Filter by slot type
            const isJointer = slotId.startsWith('S-');
            const isBeam = slotId.startsWith('H-') || !slotId.startsWith('S-');

            if ((slotType === SlotType.Jointer && !isJointer) || (slotType === SlotType.Beam && !isBeam)) {
                continue;
            }

            // Get quantity at end of week
            const quantity = getSlotQuantityAtTime(slotData, endOfWeek);

            if (quantity > 0) {
                totalQuantity += quantity;
                const volume = calculateVolume(slotData.slot, quantity);
                totalVolumeDm += volume;
            }
        }

        reports.set(weekId, {
            totalQuantity,
            totalVolumeDm: parseFloat(totalVolumeDm.toFixed(3))
        });

        console.log(`   Week ${weekId}: ${totalQuantity} units, ${parseFloat(totalVolumeDm.toFixed(3))} dm³`);
    }

    return reports;
}

// Batch write reports to Firestore
async function batchWriteReports(
    reports: Map<string, WeeklyReport>,
    slotType: SlotType
): Promise<void> {
    const collectionName = slotType === SlotType.Beam ? 'WeeklyBeamReports' : 'WeeklyJointerReports';

    console.log(`\n💾 Writing ${reports.size} reports to ${collectionName}...`);

    // Firestore batch writes are limited to 500 operations
    const batchSize = 500;
    const reportEntries = Array.from(reports.entries());

    for (let i = 0; i < reportEntries.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchEntries = reportEntries.slice(i, i + batchSize);

        for (const [weekId, reportData] of batchEntries) {
            const reportDoc = doc(db, collectionName, weekId);
            batch.set(reportDoc, reportData);
        }

        await batch.commit();
        console.log(`   Wrote batch ${Math.floor(i / batchSize) + 1} (${batchEntries.length} documents)`);
    }

    console.log(`✅ All ${slotType} reports written successfully!\n`);
}

// Main function to generate all reports
export async function generateAllWeeklyReports(): Promise<void> {
    console.log('🚀 Starting weekly report generation...\n');

    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);

    // Step 1: Download all data into memory (ONE TIME)
    const allData = await downloadAllData();

    // Step 2: Generate Jointer reports in memory
    const jointerReports = generateReportsInMemory(allData, 40, currentWeek.week, 2025, SlotType.Jointer);
    await batchWriteReports(jointerReports, SlotType.Jointer);

    // Step 3: Generate Beam reports in memory
    const beamReports = generateReportsInMemory(allData, 26, currentWeek.week, 2025, SlotType.Beam);
    await batchWriteReports(beamReports, SlotType.Beam);

    console.log('✅ All weekly reports generated successfully!');
    console.log(`📊 Total: ${jointerReports.size} Jointer reports + ${beamReports.size} Beam reports`);
}

// Uncomment to run the generation
// generateAllWeeklyReports().catch(console.error);

