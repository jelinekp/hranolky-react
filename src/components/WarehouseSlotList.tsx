import {useState, useEffect} from "react";
import {getLastSlotAction} from "../hooks/useFirestore.ts";
import {formatCsDate} from "./FormatDate.ts";
import {WarehouseSlotClass} from "../model/WarehouseSlot.ts";
import {SlotFiltersClass} from "../model/SlotFilter.ts";
import Filters from "./Filters.tsx";

enum SortingBy {
    quality,
    thickness,
    width,
    length,
    quantity,
    volume,
    lastModified,
    lastAction,
    lastChange
}


function WarehouseSlotsList(
    props: { warehouseSlots: WarehouseSlotClass[], loading: boolean }
) {

    const [sortingBy, setSortingBy] = useState<SortingBy | null>(null);
    const [activeFilters, setActiveFilters] = useState<SlotFiltersClass>(SlotFiltersClass.EMPTY);

    return (
        <div className={"flex flex-row flex-wrap-reverse"}>
            <div className={"bg-amber-100"}>
                {props.loading ? (
                    <p>Loading...</p>) : (
                    <SlotsTable warehouseSlots={props.warehouseSlots} activeFilters={activeFilters}
                                sortingBy={sortingBy}
                                setSortingBy={setSortingBy}/>
                )}
            </div>
            <div className={"bg-gray-200 px-8"}>
                <Filters activeFilters={activeFilters} setActiveFilters={setActiveFilters}/>
            </div>
        </div>
    )
        ;
}

function SlotsTable({warehouseSlots, activeFilters, sortingBy, setSortingBy}: {
    warehouseSlots: WarehouseSlotClass[],
    activeFilters: SlotFiltersClass,
    sortingBy: SortingBy | null,
    setSortingBy: (sortingBy: SortingBy) => void
}) {
    return (
        <table>
            <thead>
            <tr>
                <th onClick={() => setSortingBy(SortingBy.quality)} className={"pr-2"}>Kvalita</th>
                <th onClick={() => setSortingBy(SortingBy.thickness)} className={"pr-2"}>Tloušťka</th>
                <th onClick={() => setSortingBy(SortingBy.width)} className={"pr-2"}>Šířka</th>
                <th onClick={() => setSortingBy(SortingBy.length)} className={"pr-2"}>Délka</th>
                <th onClick={() => setSortingBy(SortingBy.quantity)} className={"pr-2"}>Množství</th>
                <th onClick={() => setSortingBy(SortingBy.volume)} className={"pr-2"}>Objem m<sup>3</sup></th>
                <th onClick={() => setSortingBy(SortingBy.lastModified)} className={"pr-2"}>Naposledy změněno</th>
                <th onClick={() => setSortingBy(SortingBy.lastAction)} className={"pr-2"}>Poslední akce</th>
                <th onClick={() => setSortingBy(SortingBy.lastChange)} className={"pr-2"}>Poslední změna</th>
            </tr>
            </thead>
            <tbody>
            {warehouseSlots
                .filter((slot) => {
                    if (activeFilters.isEmpty()) {
                        return true;
                    }

                    const matchesQuality = activeFilters.qualityFilters.length === 0 || activeFilters.qualityFilters.includes(slot.quality ?? "");
                    const matchesThickness = activeFilters.thicknessFilters.length === 0 || activeFilters.thicknessFilters.includes(slot.thickness ?? 0);
                    const matchesWidth = activeFilters.widthFilters.length === 0 || activeFilters.widthFilters.includes(slot.width ?? 0);
                    const matchesLength = activeFilters.lengthFilters.length === 0 || activeFilters.lengthFilters.some(interval => interval.contains(slot.length ?? 0));

                    return matchesQuality && matchesThickness && matchesWidth && matchesLength;
                })
                .sort((a, b) => {
                    if (sortingBy === SortingBy.quality) {
                        if (a.quality?.localeCompare && b.quality?.localeCompare) {
                            return a.quality.localeCompare(b.quality);
                        }
                    } else if (sortingBy === SortingBy.thickness) {
                        return (a.thickness ?? 0) - (b.thickness ?? 0);
                    } else if (sortingBy === SortingBy.width) {
                        return (a.width ?? 0) - (b.width ?? 0);
                    } else if (sortingBy === SortingBy.length) {
                        return (a.length ?? 0) - (b.length ?? 0);
                    } else if (sortingBy === SortingBy.quantity) {
                        return a.quantity - b.quantity;
                    } else if (sortingBy === SortingBy.volume) {
                        return (a.getVolume() ?? 0) - (b.getVolume() ?? 0);
                    } else if (sortingBy === SortingBy.lastModified) {
                        return (a.lastModified?.toMillis() ?? 0) - (b.lastModified?.toMillis() ?? 0);
                    } /*else if (sortingBy === SortingBy.lastAction) {
                        return a.;
                    } else if (sortingBy === SortingBy.lastChange) {
                        return (a.lastModified ?? 0) - (b.lastModified ?? 0);
                    }*/
                    return 0;
                })
                .map((slot) => (
                    <WarehouseSlotItem key={slot.productId} slot={slot}/>
                ))}
            </tbody>
        </table>
    )
}

function WarehouseSlotItem({slot}: { slot: WarehouseSlotClass }) {
    const [lastSlotAction, setLastSlotAction] = useState<string | null>(null);
    const [lastSlotQuantityChange, setLastSlotQuantityChange] = useState<number | null>(null);

    useEffect(() => {
        async function fetchLastAction() {
            const action = await getLastSlotAction(slot.productId);
            setLastSlotAction(action?.action || "Žádná akce");
            setLastSlotQuantityChange(action?.quantityChange || 0);
        }

        fetchLastAction();
    }, [slot.productId]);

    return (
        <tr>
            <td>{slot.quality}</td>
            <td>{slot.thickness}</td>
            <td>{slot.width}</td>
            <td>{slot.length}</td>
            <td>{slot.quantity}</td>
            <td>{slot.getVolume()?.toFixed(3)}</td>
            <td>{formatCsDate(slot.lastModified?.toDate())}</td>
            <td>{lastSlotAction ?? ""}</td>
            <td>{lastSlotQuantityChange ?? ""}</td>
        </tr>
    );
}

export default WarehouseSlotsList;
