// src/hooks/useFetchSlotActions.ts
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { SlotActionClass, SlotType } from "hranolky-firestore-common";
import { toFirestoreCollectionName } from "hranolky-firestore-common/SlotType.ts";

export const useFetchSlotActions = (slotId: string | null, slotType: SlotType) => {
    const [slotActions, setSlotActions] = useState<SlotActionClass[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [loadAllRequested, setLoadAllRequested] = useState(false);

    useEffect(() => {
        if (!slotId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSlotActions([]);
            setHasMore(false);
            setLoadAllRequested(false);
            return;
        }

        setLoading(true);
        setSlotActions([]); // Clear previous actions
        setHasMore(false);
        setLoadAllRequested(false);
    }, [slotId]);

    useEffect(() => {
        if (!slotId) {
            return;
        }

        const slotActionsRef = collection(db, toFirestoreCollectionName(slotType), slotId, "SlotActions");
        const slotActionsQuery = loadAllRequested
            ? query(slotActionsRef, orderBy("timestamp", "desc"))
            : query(slotActionsRef, orderBy("timestamp", "desc"), limit(11));

        const unsubscribe = onSnapshot(slotActionsQuery, (snapshot) => {
            const actions = snapshot.docs.map(doc => new SlotActionClass(doc.data()));
            const hasAdditionalActions = !loadAllRequested && actions.length > 10;

            setHasMore(hasAdditionalActions);
            setSlotActions(hasAdditionalActions ? actions.slice(0, 10) : actions);
            setLoading(false);
        }, () => {
            setSlotActions([]);
            setHasMore(false);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [slotId, slotType, loadAllRequested]);

    return {
        slotActions,
        loading,
        hasMore,
        loadAll: () => {
            setLoading(true);
            setLoadAllRequested(true);
        }
    };
};
