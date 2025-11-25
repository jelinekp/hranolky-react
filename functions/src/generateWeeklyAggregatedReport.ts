/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
// Import the necessary Firebase modules
import {WarehouseSlotClass} from "./WarehouseSlot";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {getFirestore} from "firebase-admin/firestore";

// ...existing code...

/**
 * Helper function to get the current date as "YY_WW" (ISO week number).
 * @returns {string} The formatted date string, e.g., "25_46".
 */
function getYearAndWeek() {
  const d = new Date();
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  // Pad week and year number with leading zeros if needed
  const weekString = String(weekNo).padStart(2, '0');
  const year2 = String(d.getUTCFullYear() % 100).padStart(2, '0');

  return `${year2}_${weekString}`;
}

// --- Your Scheduled Function ---

export const generateWeeklyReports = onSchedule(
  // Runs every Sunday at 8:00 PM (20:00).
  // Format: (minute hour day-of-month month day-of-week)
  // '0 20 * * 0' means "at minute 0, hour 20, every day, every month, on Sunday (0)"
  {schedule: "0 22 * * 0", timeZone: "Europe/Prague", region: "europe-central2",},

  async (): Promise<void> => {
    console.log("Running weekly report generation...");

    const db = getFirestore();
    const documentId = getYearAndWeek();

    // 1. Initialize accumulators
    let jointerTotalQty = 0;
    let jointerTotalVol = 0;
    let beamTotalQty = 0;
    let beamTotalVol = 0;

    // 2. Read all documents from Hranolky collection (Beams)
    const hranolySnapshot = await db.collection("Hranolky").get();

    // 3. Read all documents from Sparovky collection (Jointers)
    const sparovkySnapshot = await db.collection("Sparovky").get();

    if (hranolySnapshot.empty && sparovkySnapshot.empty) {
      console.log("No warehouse slots found. Exiting.");
      return;
    }

    // 4. Process Hranolky (Beams) slots
    hranolySnapshot.forEach((doc) => {
      const slotId = doc.id; // Already without H- prefix in new structure
      const slot = new WarehouseSlotClass(slotId, doc.data()).parsePropertiesFromProductId()

      // Get quantity, defaulting to 0 if not present
      const quantity = slot.quantity || 0;
      const volume = slot.getVolumeDm() || 0;

      beamTotalQty += quantity;
      beamTotalVol += volume;
    });

    // 5. Process Sparovky (Jointers) slots
    sparovkySnapshot.forEach((doc) => {
      const slotId = doc.id; // Already without S- prefix in new structure
      const slot = new WarehouseSlotClass(slotId, doc.data()).parsePropertiesFromProductId()

      // Get quantity, defaulting to 0 if not present
      const quantity = slot.quantity || 0;
      const volume = slot.getVolumeDm() || 0;

      jointerTotalQty += quantity;
      jointerTotalVol += volume;
    });

    console.log(`Jointer Totals: Qty=${jointerTotalQty}, Vol=${jointerTotalVol}`);
    console.log(`Beam Totals: Qty=${beamTotalQty}, Vol=${beamTotalVol}`);

    // 6. Prepare the report data
    const jointerReportData = {
      totalQuantity: jointerTotalQty,
      totalVolumeDm: jointerTotalVol,
      lastUpdated: new Date(),
    };

    const beamReportData = {
      totalQuantity: beamTotalQty,
      totalVolumeDm: beamTotalVol,
      lastUpdated: new Date(),
    };

    // 7. Write to Firestore using a batch for atomicity
    const batch = db.batch();

    // New nested collection paths
    const jointerReportRef = db.collection("WeeklyReports").doc("Sparovky").collection("WeeklyData").doc(documentId);
    const beamReportRef = db.collection("WeeklyReports").doc("Hranolky").collection("WeeklyData").doc(documentId);

    // Using .set() with merge: true will create or overwrite the doc
    batch.set(jointerReportRef, jointerReportData, {merge: true});
    batch.set(beamReportRef, beamReportData, {merge: true});

    await batch.commit();

    console.log(`Weekly reports successfully written to document: ${documentId}`);
  }
);