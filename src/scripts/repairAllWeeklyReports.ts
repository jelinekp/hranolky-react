#!/usr/bin/env tsx
/**
 * One-time script to generate ALL weekly reports (Aggregate and Per-Slot) with authentication
 * Run with: FIREBASE_EMAIL=your-email FIREBASE_PASSWORD=your-password npx tsx src/scripts/repairAllWeeklyReports.ts
 */

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { generateAllWeeklyReports } from '../hooks/generateVolumeWeeklyReport';
import { generateAllSlotWeeklyReports } from '../hooks/generateVolumeWeeklyReportPerSlot';

const email = process.env.FIREBASE_EMAIL;
const password = process.env.FIREBASE_PASSWORD;

if (!email || !password) {
  console.error('❌ Error: FIREBASE_EMAIL and FIREBASE_PASSWORD environment variables are required');
  console.error('Usage: FIREBASE_EMAIL=your-email@example.com FIREBASE_PASSWORD=your-password npx tsx src/scripts/repairAllWeeklyReports.ts');
  process.exit(1);
}

console.log('🔐 Authenticating with Firebase...');

signInWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    console.log(`✅ Authenticated as: ${userCredential.user.email}\n`);

    console.log('========================================');
    console.log('🚀 REPAIRING ALL WEEKLY REPORTS');
    console.log('========================================');
    console.log('1. Generating aggregate reports...');
    await generateAllWeeklyReports();

    console.log('\n2. Generating per-slot reports...');
    await generateAllSlotWeeklyReports();

    console.log('========================================\n');
  })
  .then(() => {
    console.log('\n========================================');
    console.log('Successfully repaired all reports! 🎉');
    console.log('========================================');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
