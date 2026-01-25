import { useState } from "react";
import { WarehouseSlotClass } from "hranolky-firestore-common";
import { SlotType } from "hranolky-firestore-common/SlotType.ts";
import Filters from "./export/Filters.tsx";
import TableSkeleton from "./table/TableSkeleton.tsx";
import Information from "./Informations.tsx";
import SlotsTable from "./table/SlotsTable.tsx";
import VolumeInTimeChart from "./VolumeInTimeChart.tsx";
import { SortingBy, SortingOrder } from "../model/Sorting.ts";
import { useSlotFiltering } from "../hooks/useSlotFiltering.ts";

function ContentLayoutContainer(
  props: {
    warehouseSlots: WarehouseSlotClass[],
    loading: boolean,
    slotType: SlotType,
    devices: Map<string, string | null>
  }
) {

  const [sortingBy, setSortingBy] = useState<SortingBy>(SortingBy.none)
  const [sortingOrder, setSortingOrder] = useState<SortingOrder>(SortingOrder.desc)

  // Use extracted filtering hook (SoS principle)
  const {
    activeFilters,
    setActiveFilters,
    filteredSlots,
    volumeSum,
    distinctValues,
    hasActiveFilters
  } = useSlotFiltering(props.warehouseSlots);

  function setSortingByAndOrder(newSortingBy: SortingBy) {

    /*
    console.log("Sorting order:", sortingOrder)
    console.log("Sorting by:", sortingBy)
    console.log("New sorting by:", newSortingBy)
    */


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
      // console.log("Sorting by:", sortingBy)
      // console.log("Sorting order:", sortingOrder)
    }
  }

  return (
    <div className={"flex flex-row flex-wrap gap-6 items-start w-full"}>
      <div
        className={"flex-[2] min-w-0 max-w-[1000px] basis-full lg:basis-0 bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-lg overflow-x-auto order-2 lg:order-1"}>
        {props.loading ? (
          <TableSkeleton />
        ) : (
          <SlotsTable
            warehouseSlots={filteredSlots}
            activeFilters={activeFilters}
            sortingBy={sortingBy}
            sortingOrder={sortingOrder}
            setSortingByAndOrder={setSortingByAndOrder}
            devices={props.devices}
            slotType={props.slotType}
          />
        )}
      </div>
      <div className={"flex-[1] min-w-[200px] basis-full lg:basis-0 flex flex-col gap-6 order-1 lg:order-2"}>
        <Filters activeFilters={activeFilters} setActiveFilters={setActiveFilters}
          distinctQualityFilters={distinctValues.qualities}
          distinctThicknessFilters={distinctValues.thicknesses}
          distinctWidthFilters={distinctValues.widths} distinctLengthFilters={distinctValues.lengths}
          filteredSlots={filteredSlots}
          slotType={props.slotType} />
        <VolumeInTimeChart
          currentVolume={volumeSum}
          slotType={props.slotType}
          filteredSlots={filteredSlots}
          hasActiveFilters={hasActiveFilters}
        />
        <Information />
      </div>
    </div>
  )
}

export default ContentLayoutContainer;