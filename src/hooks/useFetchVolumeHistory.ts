// src/hooks/useFetchVolumeHistory.ts
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { SlotType } from "hranolky-firestore-common";

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
                const collectionSegments = slotType === SlotType.Beam
                    ? ['WeeklyReports', 'Hranolky', 'WeeklyData']
                    : ['WeeklyReports', 'Sparovky', 'WeeklyData'];

                const collectionPath = collectionSegments.join('/');
                console.log('   Collection path:', collectionPath);

                const reportsRef = collection(db, collectionPath);
                // Don't use orderBy to avoid requiring a Firestore index
                // We'll sort in JavaScript instead

                console.log('   Executing query...');
                const snapshot = await getDocs(reportsRef);

                console.log('   Query complete!');
                console.log('   Documents found:', snapshot.size);
                console.log('   Document IDs:', snapshot.docs.map(doc => doc.id));

                if (snapshot.empty) {
                    console.warn('⚠️  No documents found in collection:', collectionPath);
                    setVolumeData([]);
                    setLoading(false);
                    return;
                }

                // Sort documents by ID (ascending) in JavaScript to show oldest to newest
                const sortedDocs = snapshot.docs.sort((a, b) => {
                    return a.id.localeCompare(b.id); // Ascending order (oldest to newest)
                });

                const data: VolumeDataPoint[] = sortedDocs
                    .map(doc => {
                        const weekId = doc.id; // Format: YY_WW
                        const reportData = doc.data() as WeeklyReport;

                        console.log(`   Processing doc ${weekId}:`, reportData);

                        // Keep year_week format for proper chronological ordering
                        const weekLabel = weekId; // Use YY_WW format

                        // Convert dm³ to m³ (1 m³ = 1000 dm³)
                        const volumeInM3 = reportData.totalVolumeDm / 1000;

                        return {
                            week: weekLabel,
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
