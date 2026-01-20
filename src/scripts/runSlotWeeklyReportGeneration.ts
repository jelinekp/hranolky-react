#!/usr/bin/env tsx
/**
 * One-time script to generate per-slot weekly reports
 * Run with: npx tsx src/scripts/runSlotWeeklyReportGeneration.ts
 */

import { generateAllSlotWeeklyReports } from '../hooks/reports/generateVolumeWeeklyReportPerSlot';

console.log('========================================');
console.log('Per-Slot Weekly Report Generation Script');
console.log('========================================');
console.log('This will generate weekly reports for each individual slot:');
console.log('- Beams: from week 2025_27 to current');
console.log('- Jointers: from week 2025_45 to current');
console.log('- Only weeks with quantity changes will be saved');
console.log('========================================\n');

generateAllSlotWeeklyReports()
    .then(() => {
        console.log('\n========================================');
        console.log('Script completed successfully! 🎉');
        console.log('========================================');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error generating slot weekly reports:', error);
        process.exit(1);
    });

