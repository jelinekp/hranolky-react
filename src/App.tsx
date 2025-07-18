import React from "react";
import {useFetchAllWarehouseSlots} from "./hooks/useFetchAllWarehouseSlots.ts";
import WarehouseSlotsList from "./components/WarehouseSlotList.tsx";

const App: React.FC = () => {
    const {warehouseSlots, loading} = useFetchAllWarehouseSlots("WarehouseSlots");

    return (
        <div className={"m-6 container min-h-screen"}>
            <div className={"flex justify-between items-center"}>
                <div className={"flex flex-row items-center gap-3"}>
                    <img src="src/assets/ic_launcher.webp" alt="Hranolky icon" width="64" height="64"/>
                    <h1>Hranolky</h1>
                </div>
                <img src="src/assets/logo_jelinek.svg" alt="Logo Jelínek" width="250" className="inline mr-8"/>
            </div>
            <WarehouseSlotsList warehouseSlots={warehouseSlots} loading={loading}/>
        </div>
    );
};

export default App;
