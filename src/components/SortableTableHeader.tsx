import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowUpZA, faArrowUp91, faArrowUp19, faArrowUpWideShort } from "@fortawesome/free-solid-svg-icons";
import { SortingBy, SortingOrder } from "./WarehouseSlotList";

interface SortableTableHeaderProps {
    label: string;
    sortingBy: SortingBy;
    currentSortingBy: SortingBy;
    sortingOrder: SortingOrder;
    setSortingByAndOrder: (sortingBy: SortingBy) => void;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({ label, sortingBy, currentSortingBy, sortingOrder, setSortingByAndOrder }) => {
    const isActive = currentSortingBy === sortingBy;
    const icon = isActive
        ? (sortingOrder === SortingOrder.desc ? (sortingBy === SortingBy.quality || sortingBy === SortingBy.lastAction ? faArrowUpAZ : faArrowUp91) : (sortingBy === SortingBy.quality || sortingBy === SortingBy.lastAction ? faArrowUpZA : faArrowUp19))
        : faArrowUpWideShort;

    return (
        <th onClick={() => setSortingByAndOrder(sortingBy)} className="leading-8 pr-2 cursor-pointer font-medium hover:text-[var(--color-primary)]">
            {label}
            <FontAwesomeIcon icon={icon} />
        </th>
    );
};

export default SortableTableHeader;