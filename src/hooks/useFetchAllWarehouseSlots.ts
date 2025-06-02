import {useEffect, useState} from "react"
import {collection, getDocs, limit, orderBy, query, onSnapshot} from "firebase/firestore"
import {db} from "../firebase"
import {WarehouseSlotClass} from "../model/WarehouseSlot.ts"
import {SlotActionClass} from "../model/SlotAction.ts"

export const useFetchAllWarehouseSlots = (warehouseSlotsCollection: string) => {
    const [data, setData] = useState<WarehouseSlotClass[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Listen to the main WarehouseSlots collection
        const warehouseSlotsRef = collection(db, warehouseSlotsCollection)
        const unsubscribeWarehouseSlots = onSnapshot(warehouseSlotsRef, (snapshot) => {
            const warehouseSlotsMap: Record<string, WarehouseSlotClass> = {}

            snapshot.docs.forEach((doc) => {
                const slot = new WarehouseSlotClass(doc.id, doc.data()).parsePropertiesFromProductId()
                warehouseSlotsMap[doc.id] = slot
            });

            // Listen for latest SlotAction for each slot
            const unsubscribes: (() => void)[] = Object.keys(warehouseSlotsMap).map((slotId) => {
                const slotActionsRef = collection(db, warehouseSlotsCollection, slotId, "SlotActions")
                const latestActionQuery = query(slotActionsRef, orderBy("timestamp", "desc"), limit(1))

                return onSnapshot(latestActionQuery, (slotSnapshot) => {
                    if (!slotSnapshot.empty) {
                        const latestAction = slotSnapshot.docs[0].data()
                        warehouseSlotsMap[slotId].lastSlotAction = latestAction.action || "-"
                        warehouseSlotsMap[slotId].lastSlotQuantityChange = latestAction.quantityChange || 0
                    } else {
                        warehouseSlotsMap[slotId].lastSlotAction = "-"
                        warehouseSlotsMap[slotId].lastSlotQuantityChange = null
                    }
                    // Update state when latest action changes
                    setData(Object.values(warehouseSlotsMap))
                    setLoading(false)
                });
            });

            return () => {
                unsubscribes.forEach((unsubscribe) => unsubscribe());
            };
        });

        return () => unsubscribeWarehouseSlots();
    }, [warehouseSlotsCollection])

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

            console.log("SlotAction found:", slotAction)
            return new SlotActionClass(slotAction)
        } else {
            console.log("No SlotActions found.")
            return null
        }
    } catch (error) {
        console.error("Error fetching latest SlotAction:", error)
        return null
    }
}
