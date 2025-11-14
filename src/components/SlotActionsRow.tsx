// src/components/SlotActionsRow.tsx
import React from "react";
import {SlotActionClass} from "hranolky-firestore-common/SlotAction.ts";
import {formatCsDate} from "./FormatDate";

interface SlotActionsRowProps {
    actions: SlotActionClass[];
    loading: boolean;
    isClosing?: boolean;
}

const SlotActionsRow: React.FC<SlotActionsRowProps> = ({actions, loading, isClosing = false}) => {
    const animationClass = isClosing
        ? "animate-[slideUp_400ms_ease-out]"
        : "animate-[slideDown_400ms_ease-out]";

    return (
        <tr className={`${animationClass} overflow-hidden origin-top`}>
            <td colSpan={9} className="p-4 bg-[var(--md-rgb-color-surface-container)]">
                <div className="space-y-2">
                    {/* Headers row */}
                    <div className="grid grid-cols-9 px-2 gap-2 font-semibold mb-3">
                        <div className="col-span-2">Akce</div>
                        <div className="col-span-2">Změna</div>
                        <div className="col-span-2">Terminál</div>
                        <div className="col-span-3">Čas</div>
                    </div>

                    {/* Data rows with staggered animations */}
                    {loading && actions.length === 0 ? (
                        <p className="text-gray-500">Načítání akcí...</p>
                    ) : actions.length === 0 ? (
                        <p className="text-gray-500">Žádné akce nenalezeny</p>
                    ) : (
                        <div className="space-y-1">
                            {actions.map((action, index) => (
                                <div
                                    key={`${action.userId}-${action.timestamp?.toMillis() || index}`}
                                    className="grid grid-cols-9 gap-2 py-1 px-2 bg-[var(--md-rgb-color-surface)] rounded animate-[fadeInSlideUp_300ms_ease-out_forwards] items-end"
                                    style={{
                                        animationDelay: `${index * 50}ms`
                                    }}
                                >
                                    <div className={`col-span-2 font-medium align-bottom ${action.action === "vydej" ? 'text-green-700' : action.action === "prijem" ? 'text-red-600' : 'text-blue-700'}`}>
                                        {action.getActionString() || "Neznámá akce"}
                                    </div>
                                    <div className={`col-span-2 align-bottom ${action.quantityChange > 0 ? 'text-red-600' : action.quantityChange == 0 ? 'text-blue-700' : 'text-green-700'}`}>
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