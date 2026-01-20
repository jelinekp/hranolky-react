import { useEffect, useState } from "react"
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    limit,
    Query, getDocs
} from "firebase/firestore"
import { db } from "../../firebase"
import { WarehouseSlotClass, SlotActionClass, SlotType } from "hranolky-firestore-common"
import { toFirestoreCollectionName } from "hranolky-firestore-common/SlotType.ts";

export const useFetchAllWarehouseSlots = (slotType: SlotType, options?: { enabled?: boolean }) => {
    const enabled = options?.enabled ?? true
    const [data, setData] = useState<WarehouseSlotClass[]>([])
    const [loading, setLoading] = useState(true)
    const warehouseSlotsCollection = toFirestoreCollectionName(slotType)

    useEffect(() => {
        // If fetching is disabled (e.g., waiting for auth), keep loading true and do nothing.
        if (!enabled) {
            setData([])
            setLoading(true)
            return
        }

        let innerUnsubscribes: (() => void)[] = []

        // 1. Define the base reference to the collection
        const collectionRef = collection(db, warehouseSlotsCollection);
        const warehouseSlotsQuery: Query = query(collectionRef);

        const unsubscribeWarehouseSlots = onSnapshot(warehouseSlotsQuery, (snapshot) => {
            // Clean previous inner subscriptions to prevent memory leaks
            innerUnsubscribes.forEach((u) => u())
            innerUnsubscribes = []

            const warehouseSlotsMap: Record<string, WarehouseSlotClass> = {}

            snapshot.docs.forEach((doc) => {
                const id = doc.id
                const slot = new WarehouseSlotClass(id, doc.data()).parsePropertiesFromProductId()
                warehouseSlotsMap[id] = slot
            });

            // Listen for the latest SlotAction for each slot returned by the query
            innerUnsubscribes = Object.keys(warehouseSlotsMap).map((slotId) => {
                const slotActionsRef = collection(db, warehouseSlotsCollection, slotId, "SlotActions")
                const latestActionQuery = query(slotActionsRef, orderBy("timestamp", "desc"), limit(1))

                return onSnapshot(latestActionQuery, (slotSnapshot) => {
                    const slot = warehouseSlotsMap[slotId];
                    if (!slotSnapshot.empty) {
                        const latestAction = slotSnapshot.docs[0].data()
                        slot.lastSlotAction = latestAction.action || "-"
                        slot.lastSlotQuantityChange = latestAction.quantityChange ?? 0
                    } else {
                        slot.lastSlotAction = "-"
                        slot.lastSlotQuantityChange = null
                    }
                    // Update state when latest action changes. A new array is created from the map values.
                    setData(Object.values(warehouseSlotsMap))
                });
            });

            // Set initial state and turn off loading indicator
            setData(Object.values(warehouseSlotsMap))
            setLoading(false)
        }, (error) => {
            console.error("Firebase query error:", error);
            setLoading(false);
        });

        // Cleanup function runs when the component unmounts or dependencies change
        return () => {
            unsubscribeWarehouseSlots()
            innerUnsubscribes.forEach((u) => u())
        }
    }, [warehouseSlotsCollection, slotType, enabled])

    return { warehouseSlots: data, loading }
};

export async function getLastSlotAction(warehouseSlotId: string) {
    try {
        // Reference the SlotActions subcollection inside the given WarehouseSlot document
        const slotActionsRef = collection(db, "WarehouseSlots", warehouseSlotId, "SlotActions")

        // Query: Order by timestamp (descending) and get only the latest document
        const slotActionQuery = query(slotActionsRef, orderBy("timestamp", "desc"), limit(1))

        // Fetch the document
        const querySnapshot = await getDocs(slotActionQuery)

        // Extract the document data
        if (!querySnapshot.empty) {
            const slotAction = querySnapshot.docs[0].data()

            // console.log("SlotAction found:", slotAction)
            return new SlotActionClass(slotAction)
        } else {
            // console.log("No SlotActions found.")
            return null
        }
    } catch (error) {
        console.error("Error fetching latest SlotAction:", error)
        return null
    }
}
