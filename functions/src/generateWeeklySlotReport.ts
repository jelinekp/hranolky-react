/**
 * Firebase Scheduled Function to generate per-slot weekly reports.
 * Runs every Sunday at 8:00 PM (20:00) Prague time.
 * Only creates a new SlotWeeklyReport if the quantity changed from the previous week.
 */

import {WarehouseSlotClass} from "./WarehouseSlot";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {getFirestore} from "firebase-admin/firestore";

/**
 * Helper function to get the current date as "YYYY_WW" (ISO week number).
 */
function getYearAndWeek(): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const weekString = String(weekNo).padStart(2, '0');
    return `${d.getUTCFullYear()}_${weekString}`;
}

/**
 * Get the latest SlotWeeklyReport for a slot to check if quantity changed.
 */
async function getLatestSlotReport(db: FirebaseFirestore.Firestore, slotId: string): Promise<{
    quantity: number;
    volumeDm: number;
} | null> {
    try {
        const reportsRef = db.collection("WarehouseSlots").doc(slotId).collection("SlotWeeklyReport");
        const snapshot = await reportsRef.orderBy("__name__", "desc").limit(1).get();

        if (snapshot.empty) {
            return null;
        }

        const latestDoc = snapshot.docs[0];
        const data = latestDoc.data();

        return {
            quantity: data.quantity || 0,
            volumeDm: data.volumeDm || 0
        };
    } catch (error) {
        console.warn(`Failed to get latest report for slot ${slotId}:`, error);
        return null;
    }
}

export const generateWeeklySlotReports = onSchedule(
    {
        schedule: "0 20 * * 0", // Every Sunday at 8:00 PM
        timeoutSeconds: 300,
        timeZone: "Europe/Prague"
    },

    async (): Promise<void> => {
        console.log("Running per-slot weekly report generation...");

        const db = getFirestore();
        const documentId = getYearAndWeek();

        console.log(`Generating reports for week: ${documentId}`);

        // Read all warehouse slots
        const slotsSnapshot = await db.collection("WarehouseSlots").get();

        if (slotsSnapshot.empty) {
            console.log("No warehouse slots found. Exiting.");
            return;
        }

        console.log(`Found ${slotsSnapshot.size} warehouse slots`);

        // Use batched writes (max 500 operations per batch)
        let batch = db.batch();
        let operationCount = 0;
        let totalReportsCreated = 0;
        let totalSlotsUnchanged = 0;
        const batchSize = 500;

        // Process each slot
        for (const slotDoc of slotsSnapshot.docs) {
            const slotId = slotDoc.id;
            const slot = new WarehouseSlotClass(slotId, slotDoc.data()).parsePropertiesFromProductId();

            // Get current quantity
            const currentQuantity = slot.quantity || 0;

            // Calculate current volume
            const currentVolume = slot.getVolumeDm() || 0;

            // Get the latest SlotWeeklyReport for this slot
            const latestReport = await getLatestSlotReport(db, slotId);

            // Determine if we need to create a new report
            let shouldCreateReport = false;

            if (latestReport === null) {
                // No previous report - create one if quantity > 0
                shouldCreateReport = currentQuantity > 0;
            } else {
                // Previous report exists - only create if quantity changed
                shouldCreateReport = currentQuantity !== latestReport.quantity;
            }

            if (shouldCreateReport) {
                const reportRef = db
                    .collection("WarehouseSlots")
                    .doc(slotId)
                    .collection("SlotWeeklyReport")
                    .doc(documentId);

                const reportData = {
                    quantity: currentQuantity,
                    volumeDm: parseFloat(currentVolume.toFixed(3))
                };

                batch.set(reportRef, reportData);
                operationCount++;
                totalReportsCreated++;

                // Commit batch if we've reached the limit
                if (operationCount >= batchSize) {
                    await batch.commit();
                    console.log(`Committed batch (${operationCount} operations)`);
                    batch = db.batch();
                    operationCount = 0;
                }
            } else {
                totalSlotsUnchanged++;
            }
        }

        // Commit any remaining operations
        if (operationCount > 0) {
            await batch.commit();
            console.log(`Committed final batch (${operationCount} operations)`);
        }

        console.log(`✅ Weekly slot reports generation complete!`);
        console.log(`   Reports created: ${totalReportsCreated}`);
        console.log(`   Slots unchanged: ${totalSlotsUnchanged}`);
        console.log(`   Total slots processed: ${slotsSnapshot.size}`);
    }
);


