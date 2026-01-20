import { SlotType, WarehouseSlotClass } from "hranolky-firestore-common";
import { SlotFiltersClass } from "../model/SlotFilter.ts";
import { useState } from "react";
import { useFetchSlotActions } from "../hooks/useFetchSlotActions.ts";
import TableSpannedHeader from "./TableSpannedHeader.tsx";
import SortableTableHeader from "./SortableTableHeader.tsx";
import WarehouseSlotItem from "./WarehouseSlotItem.tsx";
import SlotActionsRow from "./SlotActionsRow.tsx";
import { SortingBy, SortingOrder } from "../model/Sorting.ts";
import { sortSlots } from "../utils/slotSorting.ts";

function SlotsTable({ warehouseSlots, activeFilters, sortingBy, sortingOrder, setSortingByAndOrder, devices, slotType }: {
  warehouseSlots: WarehouseSlotClass[],
  activeFilters: SlotFiltersClass,
  sortingBy: SortingBy,
  sortingOrder: SortingOrder,
  setSortingByAndOrder: (sortingBy: SortingBy) => void,
  devices: Map<string, string | null>,
  slotType: SlotType
}) {
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);
  const [closingSlotId, setClosingSlotId] = useState<string | null>(null);
  const { slotActions, loading: actionsLoading } = useFetchSlotActions(expandedSlotId, slotType);

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
            className="pl-2 pr-4" />
          <SortableTableHeader label="Tloušť" sortingBy={SortingBy.thickness} currentSortingBy={sortingBy}
            sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder} />
          <SortableTableHeader label="Šířka" sortingBy={SortingBy.width} currentSortingBy={sortingBy}
            sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder} />
          <SortableTableHeader label="Délka" sortingBy={SortingBy.length} currentSortingBy={sortingBy}
            sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder} />
          <SortableTableHeader label="Množst" sortingBy={SortingBy.quantity} currentSortingBy={sortingBy}
            sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder} />
          <SortableTableHeader label="Objem m³" sortingBy={SortingBy.volume} currentSortingBy={sortingBy}
            sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder} />
          <SortableTableHeader label="Změněno" sortingBy={SortingBy.lastModified}
            currentSortingBy={sortingBy} sortingOrder={sortingOrder}
            setSortingByAndOrder={setSortingByAndOrder} className="pr-13" />
          <SortableTableHeader label="Akce" sortingBy={SortingBy.lastAction} currentSortingBy={sortingBy}
            sortingOrder={sortingOrder} setSortingByAndOrder={setSortingByAndOrder}
            className="pl-2" />
          <SortableTableHeader label="Změna" sortingBy={SortingBy.lastChange}
            currentSortingBy={sortingBy} sortingOrder={sortingOrder}
            setSortingByAndOrder={setSortingByAndOrder} />
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
            {sortSlots(warehouseSlots, sortingBy, sortingOrder)
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
                      devices={devices}
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
              <td />
              <td />
              <td />
            </tr>
          </>
        )}
      </tbody>
    </table>
  )
}

export default SlotsTable;