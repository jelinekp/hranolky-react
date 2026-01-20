#!/usr/bin/env tsx
/**
 * One-time script to generate all historical weekly reports
 * Run with: npx tsx src/scripts/runWeeklyReportGeneration.ts
 */

import { generateAllWeeklyReports } from '../hooks/reports/generateVolumeWeeklyReport';

console.log('========================================');
console.log('Weekly Report Generation Script');
console.log('========================================');
console.log('This will generate historical weekly reports for:');
console.log('- Beams: from week 2025_26 to current');
console.log('- Jointers: from week 2025_40 to current');
console.log('========================================\n');

generateAllWeeklyReports()
    .then(() => {
        console.log('\n========================================');
        console.log('Script completed successfully! 🎉');
        console.log('========================================');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error generating weekly reports:', error);
        process.exit(1);
    });

