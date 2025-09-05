import {useState} from "react";
import {WarehouseSlotClass} from "../model/WarehouseSlot.ts";
import {SlotFiltersClass} from "../model/SlotFilter.ts";
import Filters from "./Filters.tsx";
import SortableTableHeader from "./SortableTableHeader";
import WarehouseSlotItem from "./WarehouseSlotItem.tsx";
import TableSkeleton from "./TableSkeleton.tsx";
import Information from "./Informations.tsx";
import SlotActionsRow from "./SlotActionsRow.tsx";
import {useFetchSlotActions} from "../hooks/useFetchSlotActions.ts";

export enum SortingBy {
    quality,
    thickness,
    width,
    length,
    quantity,
    volume,
    lastModified,
    lastAction,
    lastChange,
    none
}

export enum SortingOrder {
    asc,
    desc
}

function WarehouseSlotsList(
    props: { warehouseSlots: WarehouseSlotClass[], loading: boolean }
) {

    const [sortingBy, setSortingBy] = useState<SortingBy>(SortingBy.none)
    const [sortingOrder, setSortingOrder] = useState<SortingOrder>(SortingOrder.desc)
    const [activeFilters, setActiveFilters] = useState<SlotFiltersClass>(SlotFiltersClass.EMPTY)
    const distinctQualityFilters = new Set(props.warehouseSlots.map(slot => slot.quality ?? "").filter(quality => quality !== ""));
    const distinctThicknessFilters = new Set(props.warehouseSlots.map(slot => slot.thickness ?? 0).filter(thickness => thickness !== 0));
    const distinctWidthFilters = new Set(props.warehouseSlots.map(slot => slot.width ?? 0).filter(width => width !== 0));
    const distinctLengthFilters = new Set(props.warehouseSlots.map(slot => slot.length ?? 0).filter(length => length !== 0));

    function setSortingByAndOrder(newSortingBy: SortingBy) {

        console.log("Sorting order:", sortingOrder)
        console.log("Sorting by:", sortingBy)
        console.log("New sorting by:", newSortingBy)


        if (sortingBy === newSortingBy) {
            if (sortingOrder === SortingOrder.desc) {
                setSortingOrder(SortingOrder.asc)
            } else {
                setSortingBy(SortingBy.none)
                setSortingOrder(SortingOrder.desc)
            }
        } else {
            setSortingOrder(SortingOrder.desc)
            setSortingBy(newSortingBy)
            console.log("Sorting by:", sortingBy)
            console.log("Sorting order:", sortingOrder)
        }
    }

    return (
        <div className={"flex flex-row flex-wrap-reverse gap-6 items-end"}>
            <div className={"bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-lg"}>
                {props.loading ? (
                    <TableSkeleton/>
                ) : (
                    <SlotsTable warehouseSlots={props.warehouseSlots} activeFilters={activeFilters}
                                sortingBy={sortingBy}
                                sortingOrder={sortingOrder}
                                setSortingByAndOrder={setSortingByAndOrder}/>
                )}
            </div>
            <div className={"flex flex-col gap-6 max-w-1/3 min-w-[300px] w-full"}>
                <div className={"bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-lg"}>
                    <Filters activeFilters={activeFilters} setActiveFilters={setActiveFilters}
                             distinctQualityFilters={distinctQualityFilters}
                             distinctThicknessFilters={distinctThicknessFilters}
                             distinctWidthFilters={distinctWidthFilters} distinctLengthFilters={distinctLengthFilters}/>
                </div>
                <div className={"bg-[var(--color-bg-01)] p-8 rounded-3xl max-w-113 shadow-lg"}>
                    <Information/>
                </div>
            </div>
        </div>
    )
}

function SlotsTable({warehouseSlots, activeFilters, sortingBy, sortingOrder, setSortingByAndOrder}: {
    warehouseSlots: WarehouseSlotClass[],
    activeFilters: SlotFiltersClass,
    sortingBy: SortingBy,
    sortingOrder: SortingOrder,
    setSortingByAndOrder: (sortingBy: SortingBy) => void
}) {
    const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);
    const [closingSlotId, setClosingSlotId] = useState<string | null>(null);
    const {slotActions, loading: actionsLoading} = useFetchSlotActions(expandedSlotId);

    const handleSlotToggle = (slotId: string) => {
        if (expandedSlotId === slotId) {
            // Start closing animation
            setClosingSlotId(slotId);
            setTimeout(() => {
                setExpandedSlotId(null);
                setClosingSlotId(null);
            }, 400); // Match animation duration
        } else {
            setExpandedSlotId(slotId);
            setClosingSlotId(null);
        }
    };

    const filteredSlots = warehouseSlots.filter((slot) => {
        if (activeFilters.isEmpty()) {
            return true;
        }

        const matchesQuality = activeFilters.qualityFilters.size === 0 || activeFilters.qualityFilters.has(slot.quality ?? "");
        const matchesThickness = activeFilters.thicknessFilters.size === 0 || activeFilters.thicknessFilters.has(slot.thickness ?? 0);
        const matchesWidth = activeFilters.widthFilters.size === 0 || activeFilters.widthFilters.has(slot.width ?? 0);
        const matchesLength = activeFilters.lengthIntervalFilters.size === 0 || Array.from(activeFilters.lengthIntervalFilters).some(interval => interval.contains(slot.length ?? 0));
        const matchesAllLength = activeFilters.allLengthFilters.size === 0 || activeFilters.allLengthFilters.has(slot.length ?? 0);

        return matchesQuality && matchesThickness && matchesWidth && matchesLength && matchesAllLength;
    });

    const quantitySum = filteredSlots.reduce((sum, slot) => sum + slot.quantity, 0);
    const volumeSum = filteredSlots.reduce((sum, slot) => sum + (slot.getVolume() ?? 0), 0);

    return (
        <table>
            <thead>
            <tr>
                <SortableTableHeader label="Kvalita" sortingBy={SortingBy.quality} currentSortingBy={sortingBy}
                                     sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
                <SortableTableHeader label="Tloušťka" sortingBy={SortingBy.thickness} currentSortingBy={sortingBy}
                                     sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
                <SortableTableHeader label="Šířka" sortingBy={SortingBy.width} currentSortingBy={sortingBy}
                                     sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
                <SortableTableHeader label="Délka" sortingBy={SortingBy.length} currentSortingBy={sortingBy}
                                     sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
                <SortableTableHeader label="Množství" sortingBy={SortingBy.quantity} currentSortingBy={sortingBy}
                                     sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
                <SortableTableHeader label="Objem m³" sortingBy={SortingBy.volume} currentSortingBy={sortingBy}
                                     sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
                <SortableTableHeader label="Naposledy změněno" sortingBy={SortingBy.lastModified}
                                     currentSortingBy={sortingBy} sortingOrder={sortingOrder}
                                     setSortingByAndOrder={setSortingByAndOrder}/>
                <SortableTableHeader label="Poslední akce" sortingBy={SortingBy.lastAction} currentSortingBy={sortingBy}
                                     sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
                <SortableTableHeader label="Poslední změna" sortingBy={SortingBy.lastChange}
                                     currentSortingBy={sortingBy} sortingOrder={sortingOrder}
                                     setSortingByAndOrder={setSortingByAndOrder}/>
            </tr>
            </thead>
        <tbody>
            {filteredSlots.length === 0 ? (
                <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                        {activeFilters.isEmpty()
                            ? "Žádné sloty nenalezeny"
                            : "Žádné sloty nevyhovují zadaným filtrům"
                        }
                    </td>
                </tr>
            ) : (
                <>
                    {filteredSlots
                        .sort((a, b) => {
                            if (sortingBy === SortingBy.quality) {
                                if (a.quality?.localeCompare && b.quality?.localeCompare) {
                                    if (sortingOrder === SortingOrder.asc)
                                        return b.quality.localeCompare(a.quality)
                                    else
                                        return a.quality.localeCompare(b.quality)
                                }
                            } else if (sortingBy === SortingBy.thickness) {
                                if (sortingOrder === SortingOrder.asc)
                                    return (a.thickness ?? 0) - (b.thickness ?? 0)
                                else
                                    return (b.thickness ?? 0) - (a.thickness ?? 0)
                            } else if (sortingBy === SortingBy.width) {
                                if (sortingOrder === SortingOrder.asc)
                                    return (a.width ?? 0) - (b.width ?? 0)
                                else
                                    return (b.width ?? 0) - (a.width ?? 0)
                            } else if (sortingBy === SortingBy.length) {
                                if (sortingOrder === SortingOrder.asc)
                                    return (a.length ?? 0) - (b.length ?? 0)
                                else
                                    return (b.length ?? 0) - (a.length ?? 0)
                            } else if (sortingBy === SortingBy.quantity) {
                                if (sortingOrder === SortingOrder.asc)
                                    return a.quantity - b.quantity
                                else
                                    return b.quantity - a.quantity
                            } else if (sortingBy === SortingBy.volume) {
                                if (sortingOrder === SortingOrder.asc)
                                    return (a.getVolume() ?? 0) - (b.getVolume() ?? 0)
                                else
                                    return (b.getVolume() ?? 0) - (a.getVolume() ?? 0)
                            } else if (sortingBy === SortingBy.lastModified) {
                                if (sortingOrder === SortingOrder.asc)
                                    return (a.lastModified?.toMillis() ?? 0) - (b.lastModified?.toMillis() ?? 0)
                                else
                                    return (b.lastModified?.toMillis() ?? 0) - (a.lastModified?.toMillis() ?? 0)
                            } else if (sortingBy === SortingBy.lastAction) {
                                if (sortingOrder === SortingOrder.asc)
                                    return b.lastSlotAction?.localeCompare(a.lastSlotAction ?? "") ?? 0
                                else
                                    return a.lastSlotAction?.localeCompare(b.lastSlotAction ?? "") ?? 0
                            } else if (sortingBy === SortingBy.lastChange) {
                                if (sortingOrder === SortingOrder.asc)
                                    return (a.lastSlotQuantityChange ?? 0) - (b.lastSlotQuantityChange ?? 0)
                                else
                                    return (b.lastSlotQuantityChange ?? 0) - (a.lastSlotQuantityChange ?? 0)
                            }
                            return 0;
                        })
                        .flatMap((slot) => {
                            const isExpanded = expandedSlotId === slot.productId;
                            const isClosing = closingSlotId === slot.productId;
                            const shouldShowActions = isExpanded || isClosing;

                            return [
                                <WarehouseSlotItem
                                    key={slot.productId}
                                    slot={slot}
                                    sortingBy={sortingBy}
                                    isExpanded={isExpanded}
                                    onToggle={() => handleSlotToggle(slot.productId)}
                                />,
                                ...(shouldShowActions ? [
                                    <SlotActionsRow
                                        key={`${slot.productId}-actions`}
                                        actions={slotActions}
                                        loading={actionsLoading}
                                        isClosing={isClosing}
                                    />
                                ] : [])
                            ];
                        })
                    }
                    <tr className="font-bold">
                        <td className="pl-2">Součet:</td>
                        <td/>
                        <td/>
                        <td/>
                        <td>{quantitySum}</td>
                        <td>{volumeSum.toFixed(3)}</td>
                        <td/>
                        <td/>
                        <td/>
                    </tr>
                </>
            )}
        </tbody>
        </table>
    )
}

export default WarehouseSlotsList;