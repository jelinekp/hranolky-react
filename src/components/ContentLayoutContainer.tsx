import {useState} from "react";
import {WarehouseSlotClass} from "../model/WarehouseSlot.ts";
import {SlotFiltersClass} from "../model/SlotFilter.ts";
import Filters from "./Filters.tsx";
import TableSkeleton from "./TableSkeleton.tsx";
import Information from "./Informations.tsx";
import SlotsTable from "./SlotsTable.tsx";

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

function ContentLayoutContainer(
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
      <div className={"flex flex-row flex-wrap gap-6 items-start w-full"}>
        <div className={"flex-[2] min-w-0 max-w-[1000px] basis-full lg:basis-0 bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-lg overflow-x-auto order-2 lg:order-1"}>
          {props.loading ? (
                    <TableSkeleton/>
                ) : (
                    <SlotsTable warehouseSlots={props.warehouseSlots} activeFilters={activeFilters}
                                sortingBy={sortingBy}
                                sortingOrder={sortingOrder}
                                setSortingByAndOrder={setSortingByAndOrder}/>
                )}
            </div>
        <div className={"flex-[1] min-w-[200px] basis-full lg:basis-0 flex flex-col gap-6 order-1 lg:order-2"}>
                <div className={"bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-lg"}>
                    <Filters activeFilters={activeFilters} setActiveFilters={setActiveFilters}
                             distinctQualityFilters={distinctQualityFilters}
                             distinctThicknessFilters={distinctThicknessFilters}
                             distinctWidthFilters={distinctWidthFilters} distinctLengthFilters={distinctLengthFilters}/>
                </div>
                <div className={"bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-lg"}>
                    <Information/>
                </div>
            </div>
        </div>
    )
}

export default ContentLayoutContainer;