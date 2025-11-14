// src/components/WarehouseSlotItem.tsx
import React from "react";
import {WarehouseSlotClass} from "hranolky-firestore-common";
import {formatCsDate} from "./FormatDate";
import {SortingBy} from "../model/Sorting.ts";

interface WarehouseSlotItemProps {
  slot: WarehouseSlotClass;
  sortingBy: SortingBy;
  isExpanded: boolean;
  onToggle: () => void;
}

const WarehouseSlotItem: React.FC<WarehouseSlotItemProps> = ({slot, sortingBy, isExpanded, onToggle}) => {

  const getBackgroundClass = () => {
    if (isExpanded) {
      return 'bg-[var(--md-rgb-color-surface-container)]';
    }
    return 'odd:bg-[var(--md-rgb-color-surface)] even:bg-[var(--md-rgb-color-surface-variant)]';
  };

const lastSlotActionColor = slot.lastSlotAction === "prijem"
  ? 'text-red-600'
  : slot.lastSlotAction === "vydej"
    ? 'text-green-700'
    : 'text-blue-700';

const lastSlotQuantityChangeColor = (slot.lastSlotQuantityChange ?? 0) >= 0 ? 'text-red-600' : 'text-green-700';

return (
    <tr
      className={`${getBackgroundClass()} cursor-pointer hover:bg-[var(--md-rgb-color-surface-container)] transition-colors duration-150`}
      onClick={onToggle}
    >
      <td className={`pl-2 pr-2 leading-7 pt-1 ${sortingBy === SortingBy.quality ? 'font-medium' : ''}`}>{slot.quality}</td>
      <td className={`sortingBy === SortingBy.thickness ? 'font-medium' : '' pt-1`}>{slot.thickness}</td>
      <td className={`sortingBy === SortingBy.width ? 'font-medium' : '' pt-1`}>{slot.width}</td>
      <td className={`sortingBy === SortingBy.length ? 'font-medium' : '' pt-1`}>{slot.length}</td>
      <td className={`sortingBy === SortingBy.quantity ? 'font-medium' : '' pt-1`}>{slot.quantity}</td>
      <td className={`sortingBy === SortingBy.volume ? 'font-medium' : '' pt-1`}>{slot.getVolume()?.toFixed(3)}</td>
      <td
        className={`sortingBy === SortingBy.lastModified ? 'font-medium' : '' pt-1`}>{formatCsDate(slot.lastModified?.toDate())}</td>
      <td
        className={`pl-2 pr-2 pt-1 ${sortingBy === SortingBy.lastAction ? 'font-medium' : ''} ${lastSlotActionColor}`}>{slot.getLastActionString() ?? ""}</td>
      <td className={`${sortingBy === SortingBy.lastChange ? 'font-medium' : ''} ${lastSlotQuantityChangeColor} pt-1`}>{slot.lastSlotQuantityChange ?? ""}</td>
    </tr>
  );
};

export default WarehouseSlotItem;