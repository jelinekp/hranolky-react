// src/components/SlotActionsRow.tsx
import React from "react";
import { SlotActionClass } from "../model/SlotAction";
import { formatCsDate } from "./FormatDate";

interface SlotActionsRowProps {
    actions: SlotActionClass[];
    loading: boolean;
}

const SlotActionsRow: React.FC<SlotActionsRowProps> = ({ actions, loading }) => {
    if (loading) {
        return (
            <tr>
                <td colSpan={9} className="p-4 bg-[var(--md-rgb-color-surface-container)]">
                    <div className="text-center">Načítání akcí...</div>
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td colSpan={9} className="p-4 bg-[var(--md-rgb-color-surface-container)]">
                <div className="space-y-2">
                    <h4 className="font-semibold mb-3">Posledních 10 akcí:</h4>
                    {actions.length === 0 ? (
                        <p className="text-gray-500">Žádné akce nenalezeny</p>
                    ) : (
                        <div className="space-y-1">
                            {actions.map((action, index) => (
                                <div key={index} className="flex justify-between items-center py-1 px-2 bg-[var(--md-rgb-color-surface)] rounded">
                                    <span className="font-medium">{action.action || "Neznámá akce"}</span>
                                    <span className={`${action.quantityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {action.quantityChange >= 0 ? '+' : ''}{action.quantityChange}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {action.userName} • {formatCsDate(action.timestamp?.toDate())}
                                    </span>
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