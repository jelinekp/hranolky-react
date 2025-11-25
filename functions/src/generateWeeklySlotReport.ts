/**
 * Firebase Scheduled Function to generate per-slot weekly reports.
 * Runs every Sunday at 10:00 PM (22:00) Prague time.
 * Only creates a new SlotWeeklyReport if the quantity changed from the previous week.
 */

import {WarehouseSlotClass} from "./WarehouseSlot";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {getFirestore} from "firebase-admin/firestore";

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
 * @param db Firestore instance
 * @param collectionName The collection name ('Hranolky' or 'Sparovky')
 * @param documentId The document ID (without H- or S- prefix)
 */
async function getLatestSlotReport(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  documentId: string
): Promise<{
  quantity: number;
  volumeDm: number;
} | null> {
  try {
    const reportsRef = db.collection(collectionName).doc(documentId).collection("SlotWeeklyReport");
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
    console.warn(`Failed to get latest report for ${collectionName}/${documentId}:`, error);
    return null;
  }
}

/**
 * Process a collection and generate weekly reports for all slots
 * @param db Firestore instance
 * @param collectionName The collection name ('Hranolky' or 'Sparovky')
 * @param documentId Week ID in YY_WW format
 * @param batch Current batch for writes
 * @param operationCount Current number of operations in batch
 * @param batchSize Maximum batch size
 * @returns Updated batch, operation count, reports created, and slots unchanged counts
 */
async function processCollection(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  documentId: string,
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
    return {batch, operationCount, reportsCreated: 0, slotsUnchanged: 0};
  }

  console.log(`Found ${snapshot.size} ${collectionName} slots`);

  let reportsCreated = 0;
  let slotsUnchanged = 0;

  for (const slotDoc of snapshot.docs) {
    const documentId_slot = slotDoc.id; // Already without H- or S- prefix in new structure
    const slot = new WarehouseSlotClass(documentId_slot, slotDoc.data()).parsePropertiesFromProductId();

    // Get current quantity and volume
    const currentQuantity = slot.quantity || 0;
    const currentVolume = slot.getVolumeDm() || 0;

    // Get the latest SlotWeeklyReport for this slot
    const latestReport = await getLatestSlotReport(db, collectionName, documentId_slot);

    // Determine if we need to create a new report
    let shouldCreateReport = false;

    if (latestReport === null) {
      // No previous report - create one if quantity > 0
      shouldCreateReport = currentQuantity > 0;
    } else {
      // Previous report exists - only create if quantity changed
      shouldCreateReport = currentQuantity != latestReport.quantity;
    }

    if (shouldCreateReport) {
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

      // Commit batch if we've reached the limit
      if (operationCount >= batchSize) {
        await batch.commit();
        console.log(`Committed batch (${operationCount} operations)`);
        batch = db.batch();
        operationCount = 0;
      }
    } else {
      slotsUnchanged++;
    }
  }

  return {batch, operationCount, reportsCreated, slotsUnchanged};
}

export const generateWeeklySlotReports = onSchedule(
  {
    schedule: "0 22 * * 0", // Every Sunday at 8:00 PM
    timeoutSeconds: 300,
    timeZone: "Europe/Prague",
    region: "europe-central2",
  },

  async (): Promise<void> => {
    console.log("Running per-slot weekly report generation...");

    const db = getFirestore();
    const documentId = getYearAndWeek();

    console.log(`Generating reports for week: ${documentId}`);

    // Use batched writes (max 500 operations per batch)
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
