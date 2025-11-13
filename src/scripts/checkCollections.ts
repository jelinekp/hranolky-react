#!/usr/bin/env tsx
/**
 * Debug script to check if WeeklyReports collections exist and have data
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

async function checkCollections() {
    console.log('🔍 Checking Firestore collections...\n');
    
    const collections = ['WeeklyBeamReports', 'WeeklyJointerReports'];
    
    for (const collectionName of collections) {
        console.log(`📊 Checking ${collectionName}:`);
        try {
            const ref = collection(db, collectionName);
            const snapshot = await getDocs(ref);
            
            console.log(`   Documents found: ${snapshot.size}`);
            
            if (!snapshot.empty) {
                console.log(`   Document IDs:`);
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    console.log(`      - ${doc.id}:`, data);
                });
            } else {
                console.log(`   ⚠️  Collection is EMPTY!`);
            }
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        console.log('');
    }
    
    console.log('✅ Check complete!');
}

checkCollections()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

