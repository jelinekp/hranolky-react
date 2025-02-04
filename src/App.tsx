import React from "react";
import { useFirestore } from "./hooks/useFirestore";

const App: React.FC = () => {
    const { warehouseSlots, loading } = useFirestore("WarehouseSlots"); // Replace "users" with your Firestore collection

    return (
        <div>
            <h1>Firestore Data</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {warehouseSlots.map((slot) => {
                        return (
                            <li key={slot.productId}>
                                Dřevo: {slot.quality},
                                tloušťka: {slot.thickness},
                                šířka: {slot.width},
                                délka: {slot.length},
                                množství: {slot.quantity},
                                poslední změna: {slot.lastModified?.toDate().toString()},
                                poslední akce: {slot.slotActions.at(-1)?.action}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default App;
