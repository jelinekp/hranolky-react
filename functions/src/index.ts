/**
 * Firebase Cloud Functions entry point
 * Exports all scheduled functions
 */

import {initializeApp} from "firebase-admin/app";
import {setGlobalOptions} from "firebase-functions";

setGlobalOptions({ maxInstances: 10 });
// Initialize Firebase Admin
initializeApp();

// Export scheduled functions
export {generateWeeklyReports} from "./generateWeeklyAggregatedReport";
export {generateWeeklySlotReports} from "./generateWeeklySlotReport";

