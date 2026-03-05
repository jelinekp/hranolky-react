// src/hooks/useFetchSlotActions.ts
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { SlotActionClass, SlotType } from "hranolky-firestore-common";
import { toFirestoreCollectionName } from "hranolky-firestore-common/SlotType.ts";

export const useFetchSlotActions = (slotId: string | null, slotType: SlotType) => {
    const [slotActions, setSlotActions] = useState<SlotActionClass[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!slotId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSlotActions([]);
            return;
        }

        setLoading(true);
        setSlotActions([]); // Clear previous actions

        const slotActionsRef = collection(db, toFirestoreCollectionName(slotType), slotId, "SlotActions");
        const slotActionsQuery = query(slotActionsRef, orderBy("timestamp", "desc"), limit(10));

        const unsubscribe = onSnapshot(slotActionsQuery, (snapshot) => {
            const actions = snapshot.docs.map(doc => new SlotActionClass(doc.data()));
            setSlotActions(actions);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [slotId, slotType]);

    return { slotActions, loading };
};