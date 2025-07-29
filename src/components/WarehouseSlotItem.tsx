// src/components/WarehouseSlotItem.tsx
import React from "react";
import { WarehouseSlotClass } from "../model/WarehouseSlot";
import { formatCsDate } from "./FormatDate";
import { SortingBy } from "./WarehouseSlotList";

interface WarehouseSlotItemProps {
    slot: WarehouseSlotClass;
    sortingBy: SortingBy;
    isExpanded: boolean;
    onToggle: () => void;
}

const WarehouseSlotItem: React.FC<WarehouseSlotItemProps> = ({ slot, sortingBy, isExpanded, onToggle }) => {
    return (
        <tr
            className={`odd:bg-[var(--md-rgb-color-surface)] even:bg-[var(--md-rgb-color-surface-variant)] cursor-pointer hover:bg-[var(--md-rgb-color-surface-container)] ${isExpanded ? 'bg-[var(--md-rgb-color-surface-container)]' : ''}`}
            onClick={onToggle}
        >
            <td className={`pl-2 leading-8 ${sortingBy === SortingBy.quality ? 'font-medium' : ''}`}>{slot.quality}</td>
            <td className={sortingBy === SortingBy.thickness ? 'font-medium' : ''}>{slot.thickness}</td>
            <td className={sortingBy === SortingBy.width ? 'font-medium' : ''}>{slot.width}</td>
            <td className={sortingBy === SortingBy.length ? 'font-medium' : ''}>{slot.length}</td>
            <td className={sortingBy === SortingBy.quantity ? 'font-medium' : ''}>{slot.quantity}</td>
            <td className={sortingBy === SortingBy.volume ? 'font-medium' : ''}>{slot.getVolume()?.toFixed(3)}</td>
            <td className={sortingBy === SortingBy.lastModified ? 'font-medium' : ''}>{formatCsDate(slot.lastModified?.toDate())}</td>
            <td className={sortingBy === SortingBy.lastAction ? 'font-medium' : ''}>{slot.lastSlotAction ?? ""}</td>
            <td className={sortingBy === SortingBy.lastChange ? 'font-medium' : ''}>{slot.lastSlotQuantityChange ?? ""}</td>
        </tr>
    );
};

export default WarehouseSlotItem;