// src/components/SlotActionsRow.tsx
import React from "react";
import {SlotActionClass} from "../model/SlotAction";
import {formatCsDate} from "./FormatDate";
import SlotActionsSkeleton from "./SlotActionsSkeleton";

interface SlotActionsRowProps {
    actions: SlotActionClass[];
    loading: boolean;
    isClosing?: boolean;
}

const SlotActionsRow: React.FC<SlotActionsRowProps> = ({actions, loading, isClosing = false}) => {
    if (loading) {
        return <SlotActionsSkeleton/>;
    }

    const animationClass = isClosing
        ? "animate-[slideUp_400ms_ease-out]"
        : "animate-[slideDown_400ms_ease-out]";

    return (
        <tr className={`${animationClass} overflow-hidden origin-top`}>
            <td colSpan={9} className="p-4 bg-[var(--md-rgb-color-surface-container)]">
                <div className="space-y-2">
                    {/* Headers row */}
                    <div className="grid grid-cols-9 gap-2 font-semibold mb-3">
                        <div className="col-span-2">Akce</div>
                        <div className="col-span-2">Změna</div>
                        <div className="col-span-2">Terminál</div>
                        <div className="col-span-3">Čas</div>
                    </div>

                    {/* Data rows */}
                    {actions.length === 0 ? (
                        <p className="text-gray-500">Žádné akce nenalezeny</p>
                    ) : (
                        <div className="space-y-1">
                            {actions.map((action, index) => (
                                <div key={index} className="grid grid-cols-9 gap-2 py-1 px-2 bg-[var(--md-rgb-color-surface)] rounded">
                                    <div className="col-span-2 font-medium">
                                        {action.action || "Neznámá akce"}
                                    </div>
                                    <div className={`col-span-2 ${action.quantityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {action.quantityChange >= 0 ? '+' : ''}{action.quantityChange}
                                    </div>
                                    <div className="col-span-2 text-sm">
                                        {action.userId.substring(0, 3)}
                                    </div>
                                    <div className="col-span-3 text-sm text-gray-600">
                                        {formatCsDate(action.timestamp?.toDate())}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default SlotActionsRow;