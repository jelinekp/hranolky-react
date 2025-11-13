// src/hooks/useFetchVolumeHistory.ts
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
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

export const useFetchVolumeHistory = (slotType: SlotType, weeksToShow: number = 12) => {
    const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVolumeHistory = async () => {
            setLoading(true);
            
            try {
                const collectionName = slotType === SlotType.Beam 
                    ? 'WeeklyBeamReports' 
                    : 'WeeklyJointerReports';
                
                const reportsRef = collection(db, collectionName);
                const q = query(reportsRef, orderBy('__name__', 'desc'));
                
                const snapshot = await getDocs(q);
                
                const data: VolumeDataPoint[] = snapshot.docs
                    .slice(0, weeksToShow)
                    .reverse() // Show oldest to newest
                    .map(doc => {
                        const weekId = doc.id; // Format: YYYY_WW
                        const reportData = doc.data() as WeeklyReport;
                        
                        // Parse week number for display
                        const [year, week] = weekId.split('_');
                        const weekNumber = parseInt(week, 10);
                        
                        // Create a simple label (you can customize this)
                        const label = `W${weekNumber}`;
                        
                        return {
                            week: label,
                            volume: reportData.totalVolumeDm
                        };
                    });
                
                setVolumeData(data);
            } catch (error) {
                console.error('Error fetching volume history:', error);
                setVolumeData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVolumeHistory();
    }, [slotType, weeksToShow]);

    return { volumeData, loading };
};

