import React from "react";
import {useFetchAllWarehouseSlots} from "../hooks/useFetchAllWarehouseSlots.ts";
import WarehouseSlotsList from "../components/WarehouseSlotList.tsx";
import {SlotType} from "../model/SlotType.ts";
import {useNavigate} from "react-router-dom";

const Hranolky: React.FC = () => {
    const navigate = useNavigate();
    const {warehouseSlots, loading} = useFetchAllWarehouseSlots("WarehouseSlots", SlotType.Beam);

    return (
        <div className={"m-6 container min-h-screen"}>
            <div className={"flex justify-between items-center"}>
                <div className={"flex flex-row items-center gap-3"}>
                    <img src="src/assets/ic_launcher.webp" alt="Hranolky icon" width="64" height="64"/>
                    <h1>Hranolky</h1>
                </div>
                <button
                    onClick={() => navigate("/sparovky")}
                    className="flex items-center whitespace-nowrap text-[var(--color-text-01)] hover:bg-grey p-4 rounded-lg reset-filters-button"
                >
                    <span className="text-xl leading-none">Přepnout na Spárovky</span>
                    <img src="src/assets/sparovky_foreground.svg" alt="Spárovky icon" width="40" height="40"/>
                </button>
                <img src="src/assets/logo_jelinek.svg" alt="Logo Jelínek" width="250" className="inline mr-8"/>
            </div>
            <WarehouseSlotsList warehouseSlots={warehouseSlots} loading={loading}/>
        </div>
    );
};

export default Hranolky;
