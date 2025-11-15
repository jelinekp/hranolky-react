import React from "react";
import WarehouseScreen from "../components/WarehouseScreen.tsx";
import {SlotType} from "../../common/SlotType.ts";

const Sparovky: React.FC = () => {
    return (
        <WarehouseScreen
            slotType={SlotType.Jointer}
            title="Spárovky"
            titleIconSrc="src/assets/sparovky_foreground.svg"
            titleIconWidth={64}
            titleIconHeight={64}
            switchTo={{
                to: "/hranolky",
                label: "Přepnout na Hranolky",
                iconSrc: "src/assets/hranolky_foreground.svg",
                iconWidth: 48,
                iconHeight: 48,
                className:
                    "flex items-center whitespace-nowrap text-[var(--color-text-01)] hover:bg-grey p-1 rounded-lg reset-filters-button",
            }}
        />
    );
};

export default Sparovky;
