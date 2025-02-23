import React from "react";
import {useFirestore} from "./hooks/useFirestore";
import WarehouseSlotsList from "./components/WarehouseSlotList.tsx";

const App: React.FC = () => {
    const {warehouseSlots, loading} = useFirestore("WarehouseSlots"); // Replace "users" with your Firestore collection

    return (
        <div className={"m-6 container min-h-screen"}>
            <div className={"flex justify-between items-center"}>
                <h1>Hranolky</h1>
                <img src="src/assets/logo_jelinek.svg" alt="Logo Jelínek" width="250" className="inline mr-8"/>
            </div>
            <WarehouseSlotsList warehouseSlots={warehouseSlots} loading={loading}/>
        </div>
    );
};

export default App;
