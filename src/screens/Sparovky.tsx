import React from "react";
import {useFetchAllWarehouseSlots} from "../hooks/useFetchAllWarehouseSlots.ts";
import ContentLayoutContainer from "../components/ContentLayoutContainer.tsx";
import {SlotType} from "../model/SlotType.ts";
import {useNavigate} from "react-router-dom";

const Sparovky: React.FC = () => {
    const navigate = useNavigate();
    const {warehouseSlots, loading} = useFetchAllWarehouseSlots("WarehouseSlots", SlotType.Jointer);

    return (
        <div className={"m-6 max-w-[1920px] min-h-screen"}>
            <div className={"flex justify-between items-center"}>
                <div className={"flex flex-row items-center gap-3"}>
                    <img src="src/assets/sparovky_foreground.svg" alt="Spárovky icon" width="64" height="64"/>
                    <h1>Spárovky</h1>
                </div>
                <button
                    onClick={() => navigate("/hranolky")}
                    className="flex items-center whitespace-nowrap text-[var(--color-text-01)] hover:bg-grey p-1 rounded-lg reset-filters-button"
                >
                    <span className="text-xl leading-none">Přepnout na Hranolky</span>
                    <img src="src/assets/hranolky_foreground.svg" alt="Hranolky icon" width="48" height="48"/>
                </button>
                <img src="src/assets/logo_jelinek.svg" alt="Logo Jelínek" width="250" className="inline mr-2"/>
            </div>
            <ContentLayoutContainer warehouseSlots={warehouseSlots} loading={loading} slotType={SlotType.Jointer}/>
        </div>
    );
};

export default Sparovky;
