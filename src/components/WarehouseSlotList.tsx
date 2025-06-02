import {useState} from "react";
import {WarehouseSlotClass} from "../model/WarehouseSlot.ts";
import {SlotFiltersClass} from "../model/SlotFilter.ts";
import Filters from "./Filters.tsx";
import SortableTableHeader from "./SortableTableHeader";
import WarehouseSlotItem from "./WarehouseSlotItem.tsx";

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
                    <p>Loading...</p>) : (
                    <SlotsTable warehouseSlots={props.warehouseSlots} activeFilters={activeFilters}
                                sortingBy={sortingBy}
                                sortingOrder={sortingOrder}
                                setSortingByAndOrder={setSortingByAndOrder}/>
                )}
            </div>
            <div className={"bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-lg"}>
                <Filters activeFilters={activeFilters} setActiveFilters={setActiveFilters}/>
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
    const filteredSlots = warehouseSlots.filter((slot) => {
        if (activeFilters.isEmpty()) {
            return true;
        }

        const matchesQuality = activeFilters.qualityFilters.size === 0 || activeFilters.qualityFilters.has(slot.quality ?? "");
        const matchesThickness = activeFilters.thicknessFilters.size === 0 || activeFilters.thicknessFilters.has(slot.thickness ?? 0);
        const matchesWidth = activeFilters.widthFilters.size === 0 || activeFilters.widthFilters.has(slot.width ?? 0);
        const matchesLength = activeFilters.lengthFilters.size === 0 || Array.from(activeFilters.lengthFilters).some(interval => interval.contains(slot.length ?? 0));

        return matchesQuality && matchesThickness && matchesWidth && matchesLength;
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
                .map((slot) => (
                    <WarehouseSlotItem key={slot.productId} slot={slot} sortingBy={sortingBy}/>
                ))
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
            </tbody>
        </table>
    )
}

export default WarehouseSlotsList