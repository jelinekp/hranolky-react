import React from "react";
import WarehouseScreen from "../components/WarehouseScreen.tsx";
import {SlotType} from "../../common/SlotType.ts";

const Hranolky: React.FC = () => {
    return (
        <WarehouseScreen
            slotType={SlotType.Beam}
            title="Hranolky"
            titleIconSrc="src/assets/ic_launcher.webp"
            titleIconWidth={64}
            titleIconHeight={64}
            switchTo={{
                to: "/sparovky",
                label: "Přepnout na Spárovky",
                iconSrc: "src/assets/sparovky_foreground.svg",
                iconWidth: 40,
                iconHeight: 40,
                className:
                    "flex items-center whitespace-nowrap text-[var(--color-text-01)] hover:bg-grey p-4 rounded-lg reset-filters-button",
            }}
        />
    );
};

export default Hranolky;
