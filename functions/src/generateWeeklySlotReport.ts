/**
 * Firebase Scheduled Function to generate per-slot weekly reports.
 * Runs every Sunday at 8:00 PM (20:00) Prague time.
 * Only creates a new SlotWeeklyReport if the quantity changed from the previous week.
 */

import { WarehouseSlotClass } from "./WarehouseSlot";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Helper function to get the current date as "YY_WW" (ISO week number).
 * Returns format like "25_48" (stripping first two digits of year).
 */
function getYearAndWeek(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const weekString = String(weekNo).padStart(2, '0');
  const year2 = String(d.getUTCFullYear() % 100).padStart(2, '0');
  return `${year2}_${weekString}`;
}

/**
 * Get the latest SlotWeeklyReport for a slot to check if quantity changed.
 * THROWS an error if the read fails, rather than returning null.
 */
async function getLatestSlotReport(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  documentId: string
): Promise<{
  quantity: number;
  volumeDm: number;
  weekId: string;
} | null> {
  const reportsRef = db.collection(collectionName).doc(documentId).collection("SlotWeeklyReport");

  // Since IDs are zero-padded (YY_WW), string sorting works correctly.
  const snapshot = await reportsRef.orderBy("__name__", "desc").limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const latestDoc = snapshot.docs[0];
  const data = latestDoc.data();

  return {
    quantity: Number(data.quantity) || 0, // Explicitly cast to Number to avoid string/number mismatch
    volumeDm: Number(data.volumeDm) || 0,
    weekId: latestDoc.id
  };
}

/**
 * Process a collection and generate weekly reports for all slots
 */
async function processCollection(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  documentId: string, // Current Week ID (e.g. 25_48)
  batch: FirebaseFirestore.WriteBatch,
  operationCount: number,
  batchSize: number
): Promise<{
  batch: FirebaseFirestore.WriteBatch;
  operationCount: number;
  reportsCreated: number;
  slotsUnchanged: number;
}> {
  console.log(`Processing ${collectionName} collection...`);
  const snapshot = await db.collection(collectionName).get();

  if (snapshot.empty) {
    console.log(`   No slots found in ${collectionName}`);
    return { batch, operationCount, reportsCreated: 0, slotsUnchanged: 0 };
  }

  console.log(`Found ${snapshot.size} ${collectionName} slots`);

  let reportsCreated = 0;
  let slotsUnchanged = 0;
  let errors = 0;

  for (const slotDoc of snapshot.docs) {
    const documentId_slot = slotDoc.id;
    const slot = new WarehouseSlotClass(documentId_slot, slotDoc.data()).parsePropertiesFromProductId();

    const currentQuantity = Number(slot.quantity) || 0;
    const currentVolume = Number(slot.getVolumeDm()) || 0;

    try {
      // Get the latest SlotWeeklyReport for this slot
      const latestReport = await getLatestSlotReport(db, collectionName, documentId_slot);

      // Determine if we need to create a new report
      let shouldCreateReport = false;
      let reason = "";

      if (latestReport === null) {
        // CASE 1: No previous history exists.
        // Only create a report if we actually have items (save DB space).
        if (currentQuantity > 0) {
          shouldCreateReport = true;
          reason = "First report";
        }
      } else {
        // CASE 2: Previous history exists.
        // Check if the latest report is NOT from the current week (avoid overwriting if script re-runs)
        if (latestReport.weekId === documentId) {
          // We already have a report for THIS week.
          // Only overwrite if value changed (e.g. data correction), otherwise skip.
          shouldCreateReport = currentQuantity !== latestReport.quantity;
          reason = `Update current week: ${latestReport.quantity} -> ${currentQuantity}`;
        } else {
          // Compare Current vs Previous Week
          shouldCreateReport = currentQuantity !== latestReport.quantity;
          reason = `Qty change: ${latestReport.quantity} -> ${currentQuantity}`;
        }
      }

      if (shouldCreateReport) {
        console.log(`   [${collectionName}/${documentId_slot}] Creating report: ${reason}`); // Uncomment for verbose debug

        const reportRef = db
          .collection(collectionName)
          .doc(documentId_slot)
          .collection("SlotWeeklyReport")
          .doc(documentId);

        const reportData = {
          quantity: currentQuantity,
          volumeDm: parseFloat(currentVolume.toFixed(3))
        };

        batch.set(reportRef, reportData);
        operationCount++;
        reportsCreated++;

        if (operationCount >= batchSize) {
          await batch.commit();
          console.log(`Committed batch (${operationCount} operations)`);
          batch = db.batch();
          operationCount = 0;
        }
      } else {
        slotsUnchanged++;
      }

    } catch (error) {
      // CRITICAL FIX: If reading fails, LOG it and SKIP this slot.
      // Do NOT default to creating a report, which causes duplicates.
      console.error(`Skipping ${collectionName}/${documentId_slot} due to read error:`, error);
      errors++;
    }
  }

  if (errors > 0) {
    console.warn(`⚠️ Skipped ${errors} slots due to read errors.`);
  }

  return { batch, operationCount, reportsCreated, slotsUnchanged };
}

export const generateWeeklySlotReports = onSchedule(
  {
    schedule: "0 22 * * 0", // Every Sunday at 10:00 PM
    timeoutSeconds: 1200,
    timeZone: "Europe/Prague",
    region: "europe-central2",
  },

  async (): Promise<void> => {
    console.log("Running per-slot weekly report generation...");

    const db = getFirestore();
    const documentId = getYearAndWeek();

    console.log(`Generating reports for week: ${documentId}`);

    let batch = db.batch();
    let operationCount = 0;
    let totalReportsCreated = 0;
    let totalSlotsUnchanged = 0;
    const batchSize = 500;

    // Process Hranolky collection (Beams)
    const hranolyResult = await processCollection(db, "Hranolky", documentId, batch, operationCount, batchSize);
    batch = hranolyResult.batch;
    operationCount = hranolyResult.operationCount;
    totalReportsCreated += hranolyResult.reportsCreated;
    totalSlotsUnchanged += hranolyResult.slotsUnchanged;

    // Process Sparovky collection (Jointers)
    const sparovkyResult = await processCollection(db, "Sparovky", documentId, batch, operationCount, batchSize);
    batch = sparovkyResult.batch;
    operationCount = sparovkyResult.operationCount;
    totalReportsCreated += sparovkyResult.reportsCreated;
    totalSlotsUnchanged += sparovkyResult.slotsUnchanged;

    // Commit any remaining operations
    if (operationCount > 0) {
      await batch.commit();
      console.log(`Committed final batch (${operationCount} operations)`);
    }

    console.log(`✅ Weekly slot reports generation complete!`);
    console.log(`   Reports created: ${totalReportsCreated}`);
    console.log(`   Slots unchanged: ${totalSlotsUnchanged}`);
  }
);
