import {useEffect, useState} from "react"
import {collection, getDocs, limit, orderBy, query} from "firebase/firestore"
import {db} from "../firebase"
import {WarehouseSlotClass} from "../model/WarehouseSlot.ts"
import {SlotActionClass} from "../model/SlotAction.ts"

export const useFirestore = (warehouseSlots: string) => {
    const [data, setData] = useState<WarehouseSlotClass[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, warehouseSlots))
                const items = querySnapshot.docs.map((doc=> new WarehouseSlotClass(doc.id, doc.data()).parsePropertiesFromProductId()))

                // Fetch last action for each item asynchronously
                await Promise.all(items.map(async (item) => {
                    await item.fetchLastAction(); // Ensure fetchLastAction completes
                }));

                setData(items)
            } catch (error) {
                console.error("Error fetching Firestore data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [warehouseSlots])

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
