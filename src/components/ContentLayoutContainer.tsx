import {useState, useMemo} from "react";
import {WarehouseSlotClass} from "hranolky-firestore-common";
import {SlotFiltersClass} from "../model/SlotFilter.ts";
import {SlotType} from "hranolky-firestore-common/SlotType.ts";
import Filters from "./Filters.tsx";
import TableSkeleton from "./TableSkeleton.tsx";
import Information from "./Informations.tsx";
import SlotsTable from "./SlotsTable.tsx";
import VolumeInTimeChart from "./VolumeInTimeChart.tsx";
import {SortingBy, SortingOrder} from "../model/Sorting.ts";

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
  const [activeFilters, setActiveFilters] = useState<SlotFiltersClass>(SlotFiltersClass.EMPTY)
  const distinctQualityFilters = new Set(props.warehouseSlots.map(slot => slot.quality ?? "").filter(quality => quality !== ""));
  const distinctThicknessFilters = new Set(props.warehouseSlots.map(slot => slot.thickness ?? 0).filter(thickness => thickness !== 0));
  const distinctWidthFilters = new Set(props.warehouseSlots.map(slot => slot.width ?? 0).filter(width => width !== 0));
  const distinctLengthFilters = new Set(props.warehouseSlots.map(slot => slot.length ?? 0).filter(length => length !== 0));

  // Compute filtered slots and volume sum once
  const { filteredSlots, volumeSum } = useMemo(() => {
    const filtered = props.warehouseSlots.filter((slot) => {
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

    const volume = filtered.reduce((sum, slot) => sum + (slot.getVolume() ?? 0), 0);

    return { filteredSlots: filtered, volumeSum: volume };
  }, [props.warehouseSlots, activeFilters]);

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
      <div
        className={"flex-[2] min-w-0 max-w-[1000px] basis-full lg:basis-0 bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-lg overflow-x-auto order-2 lg:order-1"}>
        {props.loading ? (
          <TableSkeleton/>
        ) : (
          <SlotsTable
            warehouseSlots={filteredSlots}
            activeFilters={activeFilters}
            sortingBy={sortingBy}
            sortingOrder={sortingOrder}
            setSortingByAndOrder={setSortingByAndOrder}
            devices={props.devices}
          />
        )}
      </div>
      <div className={"flex-[1] min-w-[200px] basis-full lg:basis-0 flex flex-col gap-6 order-1 lg:order-2"}>
        <Filters activeFilters={activeFilters} setActiveFilters={setActiveFilters}
                 distinctQualityFilters={distinctQualityFilters}
                 distinctThicknessFilters={distinctThicknessFilters}
                 distinctWidthFilters={distinctWidthFilters} distinctLengthFilters={distinctLengthFilters}/>
          <VolumeInTimeChart
            currentVolume={volumeSum}
            slotType={props.slotType}
            filteredSlots={filteredSlots}
            hasActiveFilters={!activeFilters.isEmpty()}
          />
          <Information/>
      </div>
    </div>
  )
}

export default ContentLayoutContainer;