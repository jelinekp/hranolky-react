import {WarehouseSlotClass} from "../model/WarehouseSlot.ts";
import {SlotFiltersClass} from "../model/SlotFilter.ts";
import {useState} from "react";
import {useFetchSlotActions} from "../hooks/useFetchSlotActions.ts";
import TableSpannedHeader from "./TableSpannedHeader.tsx";
import SortableTableHeader from "./SortableTableHeader.tsx";
import WarehouseSlotItem from "./WarehouseSlotItem.tsx";
import SlotActionsRow from "./SlotActionsRow.tsx";
import {SortingBy, SortingOrder} from "../model/Sorting.ts";

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

  // warehouseSlots are already filtered by parent component
  const quantitySum = warehouseSlots.reduce((sum, slot) => sum + slot.quantity, 0);
  const volumeSum = warehouseSlots.reduce((sum, slot) => sum + (slot.getVolume() ?? 0), 0);

  return (
    <table className={"w-full"}>
      <thead>
      <tr>
        <TableSpannedHeader label="Položka" colSpan={6} />
        <TableSpannedHeader label="Poslední pohyb" colSpan={3} />
      </tr>
      <tr>
        <SortableTableHeader label="Kvalita" sortingBy={SortingBy.quality} currentSortingBy={sortingBy}
                             sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}
                             className="pl-2 pr-4"/>
        <SortableTableHeader label="Tloušť" sortingBy={SortingBy.thickness} currentSortingBy={sortingBy}
                             sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
        <SortableTableHeader label="Šířka" sortingBy={SortingBy.width} currentSortingBy={sortingBy}
                             sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
        <SortableTableHeader label="Délka" sortingBy={SortingBy.length} currentSortingBy={sortingBy}
                             sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
        <SortableTableHeader label="Množst" sortingBy={SortingBy.quantity} currentSortingBy={sortingBy}
                             sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
        <SortableTableHeader label="Objem m³" sortingBy={SortingBy.volume} currentSortingBy={sortingBy}
                             sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}/>
        <SortableTableHeader label="Změněno" sortingBy={SortingBy.lastModified}
                             currentSortingBy={sortingBy} sortingOrder={sortingOrder}
                             setSortingByAndOrder={setSortingByAndOrder} className="pr-13"/>
        <SortableTableHeader label="Akce" sortingBy={SortingBy.lastAction} currentSortingBy={sortingBy}
                             sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}
                             className="pl-2"/>
        <SortableTableHeader label="Změna" sortingBy={SortingBy.lastChange}
                             currentSortingBy={sortingBy} sortingOrder={sortingOrder}
                             setSortingByAndOrder={setSortingByAndOrder}/>
      </tr>
      </thead>
      <tbody>
      {warehouseSlots.length === 0 ? (
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
          {warehouseSlots
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
            <td colSpan={2} className="pl-2">{warehouseSlots.length} řádků</td>
            <td colSpan={2} className="pl-2">Součet:</td>
            <td>{quantitySum}</td>
            <td>{volumeSum.toFixed(3)} m³</td>
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

export default SlotsTable;