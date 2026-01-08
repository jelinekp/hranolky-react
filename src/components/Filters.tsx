import { useState } from 'react'
import { ChipGroup, ChipItem, type Selection } from 'actify'
import { IntervalMmClass, SlotFiltersClass } from "../model/SlotFilter.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons/faArrowRotateLeft";
import { faFileExport } from "@fortawesome/free-solid-svg-icons/faFileExport";
import { faCopy } from "@fortawesome/free-solid-svg-icons/faCopy";
import { WarehouseSlotClass, SlotType } from "hranolky-firestore-common";
import { exportSlotsToCsv, copySlotsToClipboard } from "../hooks/exportToCsv";

type FilterType = 'quality' | 'thickness' | 'width' | 'lengthInterval' | 'allLength';

type FilterConfig<T> = {
    type: FilterType;
    label: string;
    data: Set<T>;
    selectedKeys: Set<string>;
    formatValue: (item: T) => string;
    formatDisplay: (item: T) => string;
};

function Filters(props: {
    activeFilters: SlotFiltersClass,
    setActiveFilters: (value: (((prevState: SlotFiltersClass) => SlotFiltersClass) | SlotFiltersClass)) => void,
    distinctQualityFilters: Set<string>,
    distinctThicknessFilters: Set<number>,
    distinctWidthFilters: Set<number>,
    distinctLengthFilters: Set<number>,
    filteredSlots: WarehouseSlotClass[],
    slotType: SlotType
}) {
    const { activeFilters, setActiveFilters, distinctThicknessFilters, distinctQualityFilters, distinctWidthFilters, distinctLengthFilters, filteredSlots, slotType } = props;

    const [isExporting, setIsExporting] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportStatus, setExportStatus] = useState('');
    const [showExportDialog, setShowExportDialog] = useState(false);

    const allFilters = new SlotFiltersClass(
        new Set(),
        distinctQualityFilters,
        distinctThicknessFilters,
        distinctWidthFilters,
        new Set([
            new IntervalMmClass(0, 599),
            new IntervalMmClass(600, 1199),
            new IntervalMmClass(1200, 1799),
            new IntervalMmClass(1800, 2399),
            new IntervalMmClass(2400, 2999),
        ]),
        distinctLengthFilters
    );

    const handleExport = async () => {
        if (filteredSlots.length === 0) {
            alert('Nejsou žádné sloty k exportu');
            return;
        }

        setIsExporting(true);
        setExportProgress(0);
        setExportStatus('Připravuji export...');

        try {
            await exportSlotsToCsv(filteredSlots, slotType, (progress, status) => {
                setExportProgress(progress);
                setExportStatus(status);
            });
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export selhal: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsExporting(false);
            setExportProgress(0);
            setExportStatus('');
        }
    };

    const handleCopyToClipboard = async () => {
        if (filteredSlots.length === 0) {
            alert('Nejsou žádné sloty ke zkopírování');
            return;
        }

        setIsCopying(true);
        setExportProgress(0);
        setExportStatus('Připravuji...');

        try {
            await copySlotsToClipboard(filteredSlots, slotType, (progress, status) => {
                setExportProgress(progress);
                setExportStatus(status);
            });
        } catch (error) {
            console.error('Copy failed:', error);
            alert('Kopírování selhalo: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsCopying(false);
            setExportProgress(0);
            setExportStatus('');
        }
    };

    const handleFilterSelect = (filterType: FilterType) => (value: Selection) => {
        setActiveFilters(prevState => {
            const newFilters = new SlotFiltersClass(
                prevState.typeFilters,
                prevState.qualityFilters,
                prevState.thicknessFilters,
                prevState.widthFilters,
                prevState.lengthIntervalFilters,
                prevState.allLengthFilters
            );

            switch (filterType) {
                case 'quality':
                    newFilters.qualityFilters = new Set(Array.from(value) as string[]);
                    break;
                case 'thickness':
                    newFilters.thicknessFilters = new Set(Array.from(value).map(item => parseFloat(item as string)));
                    break;
                case 'width':
                    newFilters.widthFilters = new Set(Array.from(value).map(item => parseFloat(item as string)));
                    break;
                case 'lengthInterval':
                    {
                        const intervalSet = new Set<IntervalMmClass>();
                        for (const possibleInterval of allFilters.lengthIntervalFilters) {
                            for (const item of value) {
                                if (possibleInterval.toString() === item) {
                                    intervalSet.add(possibleInterval);
                                }
                            }
                        }
                        newFilters.lengthIntervalFilters = intervalSet;
                        break;
                    }
                case 'allLength':
                    newFilters.allLengthFilters = new Set(Array.from(value).map(item => parseFloat(item as string)));
                    break;
            }

            return newFilters;
        });
    };

    const filterConfigs: Array<FilterConfig<string> | FilterConfig<number> | FilterConfig<IntervalMmClass>> = [
        {
            type: 'quality' as FilterType,
            label: "Filtr kvality",
            data: allFilters.qualityFilters,
            selectedKeys: activeFilters.qualityFilters,
            formatValue: (item: string) => item,
            formatDisplay: (item: string) => item
        },
        {
            type: 'thickness' as FilterType,
            label: "Filtr tloušťky",
            data: allFilters.thicknessFilters,
            selectedKeys: new Set(Array.from(activeFilters.thicknessFilters).map(filter => filter.toString())),
            formatValue: (item: number) => `${item} mm`,
            formatDisplay: (item: number) => `${item} mm`
        },
        {
            type: 'width' as FilterType,
            label: "Filtr šířky",
            data: allFilters.widthFilters,
            selectedKeys: new Set(Array.from(activeFilters.widthFilters).map(filter => filter.toString())),
            formatValue: (item: number) => `${item} mm`,
            formatDisplay: (item: number) => `${item} mm`
        },
        {
            type: 'lengthInterval' as FilterType,
            label: "Filtr délky",
            data: allFilters.lengthIntervalFilters,
            selectedKeys: new Set(Array.from(activeFilters.lengthIntervalFilters).map(interval => interval.toString())),
            formatValue: (item: IntervalMmClass) => `${item.toString()} mm`,
            formatDisplay: (item: IntervalMmClass) => `${item.toString()} mm`
        },
        {
            type: 'allLength' as FilterType,
            label: "Filtr délky (konkrétní hodnoty)",
            data: new Set(Array.from(allFilters.allLengthFilters).sort((a, b) => a - b)),
            selectedKeys: new Set(Array.from(activeFilters.allLengthFilters).map(filter => filter.toString())),
            formatValue: (item: number) => `${item} mm`,
            formatDisplay: (item: number) => `${item} mm`
        }
    ];

    const renderFilterGroup = <T,>(config: FilterConfig<T>) => (
        <ChipGroup
            key={config.type}
            label={config.label}
            selectionMode="multiple"
            selectedKeys={config.selectedKeys}
            onSelectionChange={handleFilterSelect(config.type)}
        >
            {Array.from(config.data).map((filter) => (
                <ChipItem
                    key={String(filter)}
                    textValue={config.formatValue(filter)}
                >
                    {config.formatDisplay(filter)}
                </ChipItem>
            ))}
        </ChipGroup>
    );

    return (
        <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-lg flex-y space-y-4">
            <h3>Filtry</h3>
            {filterConfigs.map(config => renderFilterGroup(config as FilterConfig<string | number | IntervalMmClass>))}

            <div className="flex flex-wrap gap-2 mt-4">
                <button
                    onClick={() => setActiveFilters(SlotFiltersClass.EMPTY)}
                    className="text-[var(--color-text-01)] hover:bg-grey p-2 rounded-lg reset-filters-button"
                >
                    <FontAwesomeIcon icon={faArrowRotateLeft} className="mr-2" />
                    Resetovat všechny filtry
                </button>

                <button
                    onClick={() => setShowExportDialog(true)}
                    disabled={filteredSlots.length === 0}
                    className={`text-[var(--color-text-01)] p-2 rounded-lg flex items-center gap-2
                            ${filteredSlots.length === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-grey cursor-pointer'}`}
                >
                    <FontAwesomeIcon icon={faFileExport} />
                    Exportovat historii stavů ({filteredSlots.length})
                </button>
            </div>

            {/* Export Dialog */}
            {showExportDialog && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setShowExportDialog(false)}
                >
                    <div
                        className="bg-[var(--color-bg-01)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-semibold mb-4">Exportovat historii stavů</h3>

                        {filteredSlots.length > 100 && (
                            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                                <p className="text-yellow-800 text-sm">
                                    ⚠️ Export může trvat déle při velkém množství položek (cca {filteredSlots.length / 10} sekund).
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setShowExportDialog(false);
                                    handleExport();
                                }}
                                disabled={isExporting || isCopying}
                                className={`w-full text-left p-4 rounded-lg border-2 flex items-center gap-3
                                    ${isExporting || isCopying
                                        ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                        : 'hover:bg-grey hover:border-blue-500 cursor-pointer border-gray-300'}`}
                            >
                                <FontAwesomeIcon icon={faFileExport} className="text-xl" />
                                <div>
                                    <div className="font-semibold">Stáhnout jako CSV</div>
                                    <div className="text-sm text-gray-600">Uložit data do CSV souboru</div>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    setShowExportDialog(false);
                                    handleCopyToClipboard();
                                }}
                                disabled={isExporting || isCopying}
                                className={`w-full text-left p-4 rounded-lg border-2 flex items-center gap-3
                                    ${isExporting || isCopying
                                        ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                        : 'hover:bg-grey hover:border-blue-500 cursor-pointer border-gray-300'}`}
                            >
                                <FontAwesomeIcon icon={faCopy} className="text-xl" />
                                <div>
                                    <div className="font-semibold">Kopírovat pro Excel</div>
                                    <div className="text-sm text-gray-600">Zkopírovat data do schránky</div>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowExportDialog(false)}
                            className="w-full mt-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Zrušit
                        </button>
                    </div>
                </div>
            )}

            {(isExporting || isCopying) && (
                <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${exportProgress}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{exportStatus}</p>
                </div>
            )}
        </div>
    );
}

export default Filters;