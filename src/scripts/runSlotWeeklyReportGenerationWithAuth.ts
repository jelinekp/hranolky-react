#!/usr/bin/env tsx
/**
 * One-time script to generate per-slot weekly reports with authentication
 * Run with: npx tsx src/scripts/runSlotWeeklyReportGenerationWithAuth.ts
 * 
 * You'll need to provide your Firebase email and password as environment variables:
 * FIREBASE_EMAIL=your-email@example.com FIREBASE_PASSWORD=your-password npx tsx src/scripts/runSlotWeeklyReportGenerationWithAuth.ts
 */

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { generateAllSlotWeeklyReports } from '../hooks/generateVolumeWeeklyReportPerSlot';

const email = process.env.FIREBASE_EMAIL;
const password = process.env.FIREBASE_PASSWORD;

if (!email || !password) {
  console.error('❌ Error: FIREBASE_EMAIL and FIREBASE_PASSWORD environment variables are required');
  console.error('Usage: FIREBASE_EMAIL=your-email@example.com FIREBASE_PASSWORD=your-password npx tsx src/scripts/runSlotWeeklyReportGenerationWithAuth.ts');
  process.exit(1);
}

console.log('🔐 Authenticating with Firebase...');

signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log(`✅ Authenticated as: ${userCredential.user.email}\n`);

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
