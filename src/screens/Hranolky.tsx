import React from "react";
import {useFetchAllWarehouseSlots} from "../hooks/useFetchAllWarehouseSlots.ts";
import ContentLayoutContainer from "../components/ContentLayoutContainer.tsx";
import {SlotType} from "../../common/SlotType.ts";
import {useNavigate} from "react-router-dom";

const Hranolky: React.FC = () => {
    const navigate = useNavigate();
    const {warehouseSlots, loading} = useFetchAllWarehouseSlots("WarehouseSlots", SlotType.Beam);

    return (
        <div className={"m-6 max-w-[1920px] min-h-screen"}>
            <div className={"flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6"}>
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
                <img src="src/assets/logo_jelinek.svg" alt="Logo Jelínek" width="250" className="inline mr-2"/>
            </div>
            <ContentLayoutContainer warehouseSlots={warehouseSlots} loading={loading} slotType={SlotType.Beam}/>
        </div>
    );
};

export default Hranolky;
