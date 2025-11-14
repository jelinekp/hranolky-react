// src/hooks/useFetchUserDevices.ts
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const useFetchUserDevices = () => {
    const [devices, setDevices] = useState<Map<string, string | null>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevices = async () => {
            console.log('🔍 Fetching user devices...');
            setLoading(true);

            try {
                const devicesRef = collection(db, 'devices');
                const snapshot = await getDocs(devicesRef);

                console.log(`   Found ${snapshot.size} devices`);

                const deviceMap = new Map<string, string | null>();

                snapshot.forEach(doc => {
                    const deviceId = doc.id;
                    const data = doc.data();
                    const deviceName = data.deviceName || null;

                    deviceMap.set(deviceId, deviceName);
                    console.log(`   Device: ${deviceId} → ${deviceName || '(no name)'}`);
                });

                setDevices(deviceMap);
                console.log('✅ Devices loaded successfully');
            } catch (error) {
                console.error('❌ Error fetching devices:', error);
                setDevices(new Map());
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    return { devices, loading };
};

