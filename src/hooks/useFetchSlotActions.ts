// src/hooks/useFetchSlotActions.ts
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase";
import { SlotActionClass } from "hranolky-firestore-common";

export const useFetchSlotActions = (slotId: string | null) => {
    const [slotActions, setSlotActions] = useState<SlotActionClass[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!slotId) {
            setSlotActions([]);
            return;
        }

        setLoading(true);
        setSlotActions([]); // Clear previous actions

        const slotActionsRef = collection(db, "WarehouseSlots", slotId, "SlotActions");
        const slotActionsQuery = query(slotActionsRef, orderBy("timestamp", "desc"), limit(10));

        const unsubscribe = onSnapshot(slotActionsQuery, (snapshot) => {
            const actions = snapshot.docs.map(doc => new SlotActionClass(doc.data()));

            // Add actions one by one with a staggered delay
            actions.forEach((action, index) => {
                setTimeout(() => {
                    setSlotActions(prev => [...prev, action]);
                    if (index === actions.length - 1) {
                        setLoading(false);
                    }
                }, index * 20); // 20ms delay between each action
            });

            // If no actions, stop loading immediately
            if (actions.length === 0) {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [slotId]);

    return { slotActions, loading };
};