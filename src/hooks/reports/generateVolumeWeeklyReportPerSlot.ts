/* Generate weekly reports per slot in Firestore database
   This script populates historical weekly reports for each individual warehouse slot
   Updated to use new Firestore structure with Hranolky and Sparovky collections.
   Run this once to generate all historical data.
 */

import { collection, doc, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { WarehouseSlotClass } from "hranolky-firestore-common";

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
    return { year: d.getUTCFullYear(), week: weekNo };
}

// Helper function to format week ID as "YY_WW" (two-digit year)
function formatWeekId(year: number, week: number): string {
    const year2 = String(year % 100).padStart(2, '0');
    const weekString = String(week).padStart(2, '0');
    return `${year2}_${weekString}`;
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

// Download all slots from a single collection into memory
async function downloadCollection(collectionName: string): Promise<Map<string, SlotData>> {
    console.log(`📥 Downloading ${collectionName} slots...`);

    const collectionRef = collection(db, collectionName);
    const slotsSnapshot = await getDocs(collectionRef);

    console.log(`   Found ${slotsSnapshot.size} ${collectionName} slots`);

    const data = new Map<string, SlotData>();
    let totalActions = 0;

    for (const slotDoc of slotsSnapshot.docs) {
        const slotId = slotDoc.id;
        const slot = new WarehouseSlotClass(slotId, slotDoc.data()).parsePropertiesFromProductId();

        // Download all actions for this slot
        const slotActionsRef = collection(db, collectionName, slotId, 'SlotActions');
        const actionsSnapshot = await getDocs(slotActionsRef);

        const actions = actionsSnapshot.docs
            .map(doc => doc.data() as SlotAction)
            .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()); // Sort by timestamp ascending

        totalActions += actions.length;
        data.set(slotId, { slot, actions });
    }

    console.log(`   Downloaded ${totalActions} actions for ${collectionName}`);
    return data;
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
        const weekId = formatWeekId(year, week);
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

// Batch write reports for all slots in a collection to Firestore
async function batchWriteSlotReports(
    collectionName: string,
    allData: Map<string, SlotData>,
    startWeek: number,
    endWeek: number,
    year: number
): Promise<void> {
    console.log(`\n💾 Writing per-slot weekly reports for ${collectionName}...`);

    let totalReports = 0;
    let batch = writeBatch(db);
    let operationCount = 0;
    const batchSize = 500; // Firestore batch write limit

    for (const [slotId, slotData] of allData.entries()) {
        // Generate reports for this slot
        const slotReports = generateSlotReportsInMemory(slotId, slotData, startWeek, endWeek, year);

        // Write each report
        for (const [weekId, reportData] of slotReports.entries()) {
            const reportDoc = doc(db, collectionName, slotId, 'SlotWeeklyReport', weekId);
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

    console.log(`✅ Wrote ${totalReports} slot weekly reports for ${collectionName}!\n`);
}

// Main function to generate all per-slot weekly reports
export async function generateAllSlotWeeklyReports(): Promise<void> {
    console.log('🚀 Starting per-slot weekly report generation...\n');

    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);

    // Define start points
    const hranolkyStartYear = 2025;
    const hranolkyStartWeek = 27;
    const sparovkyStartYear = 2025;
    const sparovkyStartWeek = 45;

    // Step 1: Download Hranolky (Beams) data
    console.log('📊 Processing Hranolky (Beams)...');
    const hranolyData = await downloadCollection('Hranolky');

    // Generate for all years from start to current
    let year = hranolkyStartYear;
    let week = hranolkyStartWeek;
    while (year < currentWeek.year || (year === currentWeek.year && week <= currentWeek.week)) {
        const endWeekThisYear = year < currentWeek.year ? 52 : currentWeek.week;
        await batchWriteSlotReports('Hranolky', hranolyData, week, endWeekThisYear, year);

        // Move to next year
        year++;
        week = 1; // Start from week 1 for subsequent years
    }

    // Step 2: Download Sparovky (Jointers) data
    console.log('📊 Processing Sparovky (Jointers)...');
    const sparovkyData = await downloadCollection('Sparovky');

    // Generate for all years from start to current
    year = sparovkyStartYear;
    week = sparovkyStartWeek;
    while (year < currentWeek.year || (year === currentWeek.year && week <= currentWeek.week)) {
        const endWeekThisYear = year < currentWeek.year ? 52 : currentWeek.week;
        await batchWriteSlotReports('Sparovky', sparovkyData, week, endWeekThisYear, year);

        // Move to next year
        year++;
        week = 1; // Start from week 1 for subsequent years
    }

    console.log('✅ All per-slot weekly reports generated successfully!');
}

// Uncomment to run the generation
// generateAllSlotWeeklyReports().catch(console.error);
