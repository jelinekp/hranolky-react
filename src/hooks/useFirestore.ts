import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {WarehouseSlotClass} from "../model/WarehouseSlot.ts";

export const useFirestore = (collectionName: string) => {
    const [data, setData] = useState<WarehouseSlotClass[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, collectionName));
                const items = querySnapshot.docs.map((doc=> new WarehouseSlotClass(doc.id, doc.data()).parsePropertiesFromProductId()));
                setData(items);
            } catch (error) {
                console.error("Error fetching Firestore data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [collectionName]);

    return { warehouseSlots: data, loading };
};
