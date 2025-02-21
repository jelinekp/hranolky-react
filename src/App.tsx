import React from "react";
import {useFirestore} from "./hooks/useFirestore";
import WarehouseSlotsList from "./components/WarehouseSlotList.tsx";

const App: React.FC = () => {
    const {warehouseSlots, loading} = useFirestore("WarehouseSlots"); // Replace "users" with your Firestore collection

    return (
        <div className={"m-6 container h-screen bg-gray-50"}>
            <h1>Hranolky</h1>
            <WarehouseSlotsList warehouseSlots={warehouseSlots} loading={loading}/>
        </div>
    );
};

export default App;
