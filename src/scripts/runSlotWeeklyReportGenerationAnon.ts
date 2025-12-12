#!/usr/bin/env tsx
/**
 * One-time script to generate per-slot weekly reports with anonymous authentication
 * Run with: npx tsx src/scripts/runSlotWeeklyReportGenerationAnon.ts
 */

import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';
import { generateAllSlotWeeklyReports } from '../hooks/generateVolumeWeeklyReportPerSlot';

console.log('🔐 Authenticating anonymously with Firebase...');

signInAnonymously(auth)
  .then((userCredential) => {
    console.log(`✅ Authenticated anonymously (UID: ${userCredential.user.uid})\n`);

    console.log('========================================');
    console.log('Per-Slot Weekly Report Generation Script');
    console.log('========================================');
    console.log('This will generate weekly reports for each individual slot:');
    console.log('- Beams: from week 2025_27 to current');
    console.log('- Jointers: from week 2025_45 to current');
    console.log('- Only weeks with quantity changes will be saved');
    console.log('========================================\n');

    return generateAllSlotWeeklyReports();
  })
  .then(() => {
    console.log('\n========================================');
    console.log('Script completed successfully! 🎉');
    console.log('========================================');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
