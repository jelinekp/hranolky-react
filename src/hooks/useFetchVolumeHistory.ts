// src/hooks/useFetchVolumeHistory.ts
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { SlotType } from "../model/SlotType";

interface VolumeDataPoint {
    week: string;
    volume: number;
}

interface WeeklyReport {
    totalQuantity: number;
    totalVolumeDm: number;
}

export const useFetchVolumeHistory = (slotType: SlotType, weeksToShow: number = 500) => {
    const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVolumeHistory = async () => {
            console.log('🔍 useFetchVolumeHistory: Starting fetch...');
            console.log('   SlotType:', slotType);
            console.log('   WeeksToShow:', weeksToShow);

            setLoading(true);
            
            try {
                const collectionName = slotType === SlotType.Beam 
                    ? 'WeeklyBeamReports' 
                    : 'WeeklyJointerReports';
                
                console.log('   Collection name:', collectionName);

                const reportsRef = collection(db, collectionName);
                // Don't use orderBy to avoid requiring a Firestore index
                // We'll sort in JavaScript instead

                console.log('   Executing query...');
                const snapshot = await getDocs(reportsRef);

                console.log('   Query complete!');
                console.log('   Documents found:', snapshot.size);
                console.log('   Document IDs:', snapshot.docs.map(doc => doc.id));

                if (snapshot.empty) {
                    console.warn('⚠️  No documents found in collection:', collectionName);
                    setVolumeData([]);
                    setLoading(false);
                    return;
                }

                // Sort documents by ID (descending) in JavaScript
                const sortedDocs = snapshot.docs.sort((a, b) => {
                    return b.id.localeCompare(a.id); // Descending order
                });

                const data: VolumeDataPoint[] = sortedDocs
                    .slice(0, weeksToShow)
                    .reverse() // Show oldest to newest
                    .map(doc => {
                        const weekId = doc.id; // Format: YYYY_WW
                        const reportData = doc.data() as WeeklyReport;
                        
                        console.log(`   Processing doc ${weekId}:`, reportData);

                        // Parse week number for display
                        const [_year, week] = weekId.split('_');
                        const weekNumber = parseInt(week, 10);
                        
                        // Create a simple label (you can customize this)
                        const label = `${weekNumber}`;
                        
                        // Convert dm³ to m³ (1 m³ = 1000 dm³)
                        const volumeInM3 = reportData.totalVolumeDm / 1000;

                        return {
                            week: label,
                            volume: parseFloat(volumeInM3.toFixed(3))
                        };
                    });
                
                console.log('✅ Processed data:', data);
                setVolumeData(data);
            } catch (error) {
                console.error('❌ Error fetching volume history:', error);
                console.error('   Error details:', error);
                setVolumeData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVolumeHistory();
    }, [slotType, weeksToShow]);

    return { volumeData, loading };
};

