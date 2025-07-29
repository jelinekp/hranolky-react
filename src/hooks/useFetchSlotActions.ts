// src/hooks/useFetchSlotActions.ts
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase";
import { SlotActionClass } from "../model/SlotAction";

export const useFetchSlotActions = (slotId: string | null) => {
    const [slotActions, setSlotActions] = useState<SlotActionClass[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!slotId) {
            setSlotActions([]);
            return;
        }

        setLoading(true);
        const slotActionsRef = collection(db, "WarehouseSlots", slotId, "SlotActions");
        const slotActionsQuery = query(slotActionsRef, orderBy("timestamp", "desc"), limit(10));

        const unsubscribe = onSnapshot(slotActionsQuery, (snapshot) => {
            const actions = snapshot.docs.map(doc => new SlotActionClass(doc.data()));
            setSlotActions(actions);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [slotId]);

    return { slotActions, loading };
};