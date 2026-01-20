import SortableTableHeader from "./SortableTableHeader.tsx";
import TableSpannedHeader from "./TableSpannedHeader.tsx";
import {SortingBy, SortingOrder} from "../../model/Sorting.ts";

function TableSkeleton() {
    const skeletonRows = Array.from({ length: 18 }, (_, i) => (
        <tr key={i} className="odd:bg-[var(--md-rgb-color-surface)] even:bg-[var(--md-rgb-color-surface-variant)]">
            <td className="p-2 leading-8">
                <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
            </td>
            <td className="p-2">
                <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
            </td>
            <td className="p-2">
                <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
            </td>
            <td className="p-2">
                <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
            </td>
            <td className="p-2">
                <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
            </td>
            <td className="p-2">
                <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
            </td>
            <td className="p-2">
                <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
            </td>
            <td className="p-2">
                <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
            </td>
            <td className="p-2">
                <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
            </td>
        </tr>
    ));

    return (
        <table className={"w-full"}>
            <thead>
            <tr>
              <TableSpannedHeader label="Položka" colSpan={6} />
              <TableSpannedHeader label="Poslední pohyb" colSpan={3} />
            </tr>
            <tr>
                <SortableTableHeader label="Kvalita" sortingBy={SortingBy.quality} currentSortingBy={SortingBy.none}
                                     sortingOrder={SortingOrder.desc} setSortingByAndOrder={() => {}} className="pl-2 pr-4"/>
                <SortableTableHeader label="Tloušť" sortingBy={SortingBy.thickness} currentSortingBy={SortingBy.none}
                                     sortingOrder={SortingOrder.desc} setSortingByAndOrder={() => {}}/>
                <SortableTableHeader label="Šířka" sortingBy={SortingBy.width} currentSortingBy={SortingBy.none}
                                     sortingOrder={SortingOrder.desc} setSortingByAndOrder={() => {}}/>
                <SortableTableHeader label="Délka" sortingBy={SortingBy.length} currentSortingBy={SortingBy.none}
                                     sortingOrder={SortingOrder.desc} setSortingByAndOrder={() => {}}/>
                <SortableTableHeader label="Množst" sortingBy={SortingBy.quantity} currentSortingBy={SortingBy.none}
                                     sortingOrder={SortingOrder.desc} setSortingByAndOrder={() => {}}/>
                <SortableTableHeader label="Objem m³" sortingBy={SortingBy.volume} currentSortingBy={SortingBy.none}
                                     sortingOrder={SortingOrder.desc} setSortingByAndOrder={() => {}}/>
                <SortableTableHeader label="Změněno" sortingBy={SortingBy.lastModified}
                                     currentSortingBy={SortingBy.none} sortingOrder={SortingOrder.desc}
                                     setSortingByAndOrder={() => {}} className="pr-13"/>
                <SortableTableHeader label="Akce" sortingBy={SortingBy.lastAction} currentSortingBy={SortingBy.none}
                                     sortingOrder={SortingOrder.desc} setSortingByAndOrder={() => {}} className="pl-2"/>
                <SortableTableHeader label="Změna" sortingBy={SortingBy.lastChange}
                                     currentSortingBy={SortingBy.none} sortingOrder={SortingOrder.desc}
                                     setSortingByAndOrder={() => {}}/>
            </tr>
            </thead>
            <tbody>
            {skeletonRows}
            <tr className="font-bold">
                <td className="pl-2">Součet:</td>
                <td/>
                <td/>
                <td/>
                <td className="p-2">
                    <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                </td>
                <td className="p-2">
                    <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                </td>
                <td/>
                <td/>
                <td/>
            </tr>
            </tbody>
        </table>
    );
}

export default TableSkeleton;