import { useEffect, useState } from "react";
import { collection, query, onSnapshot, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export interface DeviceAdminData {
  id: string;
  shortId: string;
  deviceName: string;
  appVersion: string;
  isInventoryCheckPermitted: boolean;
  lastSeen: Date | null;
}

export const useAdminDevices = () => {
  const [devices, setDevices] = useState<DeviceAdminData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const devicesRef = collection(db, 'Devices');
    const q = query(devicesRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deviceList: DeviceAdminData[] = snapshot.docs.map(doc => {
        const data = doc.data();

        // Skip deprecated devices
        if (data.deprecated) return null;

        const lastSeenTimestamp = data.lastSeen as Timestamp | undefined;

        return {
          id: doc.id,
          shortId: doc.id.substring(0, 3),
          deviceName: data.deviceName || '',
          appVersion: data.appVersion || 'N/A',
          isInventoryCheckPermitted: !!data.isInventoryCheckPermitted,
          lastSeen: lastSeenTimestamp ? lastSeenTimestamp.toDate() : null
        };
      }).filter(Boolean) as DeviceAdminData[];
      setDevices(deviceList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching devices for admin:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateDevice = async (deviceId: string, updates: Partial<DeviceAdminData>) => {
    try {
      const deviceRef = doc(db, 'Devices', deviceId);
      await updateDoc(deviceRef, {
        ...updates
      });
      return true;
    } catch (error) {
      console.error("Error updating device:", error);
      return false;
    }
  };

  return { devices, loading, updateDevice };
};
