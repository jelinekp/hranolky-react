/* Generate weekly reports per slot in Firestore database
   This script populates historical weekly reports for each individual warehouse slot
   Run this once to generate all historical data.
 */

import {collection, doc, getDocs, writeBatch, Timestamp} from 'firebase/firestore';
import {db} from '../firebase';
import {WarehouseSlotClass, SlotType} from "hranolky-firestore-common";

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

interface SlotWeeklyReport {
    quantity: number;
    volumeDm: number;
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

// Generate reports for a single slot across all weeks
function generateSlotReportsInMemory(
    _slotId: string,
    slotData: SlotData,
    startWeek: number,
    endWeek: number,
    year: number
): Map<string, SlotWeeklyReport> {
    const reports = new Map<string, SlotWeeklyReport>();
    let previousQuantity = 0;

    for (let week = startWeek; week <= endWeek; week++) {
        const weekId = `${year}_${String(week).padStart(2, '0')}`;
        const endOfWeek = getEndOfWeek(year, week);

        // Get quantity at end of week
        const quantity = getSlotQuantityAtTime(slotData, endOfWeek);

        // Only create a report if quantity changed from previous week
        if (quantity !== previousQuantity) {
            const volumeDm = calculateVolume(slotData.slot, quantity);

            reports.set(weekId, {
                quantity,
                volumeDm: parseFloat(volumeDm.toFixed(3))
            });

            previousQuantity = quantity;
        }
    }

    return reports;
}

// Batch write reports for all slots to Firestore
async function batchWriteSlotReports(
    allData: Map<string, SlotData>,
    startWeek: number,
    endWeek: number,
    year: number,
    slotType: SlotType
): Promise<void> {
    console.log(`\n💾 Writing per-slot weekly reports for ${slotType === SlotType.Beam ? 'Beams' : 'Jointers'}...`);

    let totalReports = 0;
    let batch = writeBatch(db);
    let operationCount = 0;
    const batchSize = 500; // Firestore batch write limit

    for (const [slotId, slotData] of allData.entries()) {
        // Filter by slot type
        const isJointer = slotId.startsWith('S-');
        const isBeam = slotId.startsWith('H-') || !slotId.startsWith('S-');

        if ((slotType === SlotType.Jointer && !isJointer) || (slotType === SlotType.Beam && !isBeam)) {
            continue;
        }

        // Generate reports for this slot
        const slotReports = generateSlotReportsInMemory(slotId, slotData, startWeek, endWeek, year);

        // Write each report
        for (const [weekId, reportData] of slotReports.entries()) {
            const reportDoc = doc(db, 'WarehouseSlots', slotId, 'SlotWeeklyReport', weekId);
            batch.set(reportDoc, reportData);
            operationCount++;
            totalReports++;

            // Commit batch if we've reached the limit
            if (operationCount >= batchSize) {
                await batch.commit();
                console.log(`   Committed batch (${operationCount} operations)`);
                batch = writeBatch(db);
                operationCount = 0;
            }
        }
    }

    // Commit any remaining operations
    if (operationCount > 0) {
        await batch.commit();
        console.log(`   Committed final batch (${operationCount} operations)`);
    }

    console.log(`✅ Wrote ${totalReports} slot weekly reports for ${slotType === SlotType.Beam ? 'Beams' : 'Jointers'}!\n`);
}

// Main function to generate all per-slot weekly reports
export async function generateAllSlotWeeklyReports(): Promise<void> {
    console.log('🚀 Starting per-slot weekly report generation...\n');

    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);

    // Step 1: Download all data into memory (ONE TIME)
    const allData = await downloadAllData();

    // Step 2: Generate Beam reports (week 27 to current)
    console.log('📊 Generating Beam slot reports from week 2025_27 to current...');
    await batchWriteSlotReports(allData, 27, currentWeek.week, 2025, SlotType.Beam);

    // Step 3: Generate Jointer reports (week 45 to current)
    console.log('📊 Generating Jointer slot reports from week 2025_45 to current...');
    await batchWriteSlotReports(allData, 45, currentWeek.week, 2025, SlotType.Jointer);

    console.log('✅ All per-slot weekly reports generated successfully!');
}

// Uncomment to run the generation
// generateAllSlotWeeklyReports().catch(console.error);
