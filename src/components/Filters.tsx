import {ChipGroup, ChipItem, type Selection} from 'actify'
import {IntervalMmClass, SlotFiltersClass} from "../model/SlotFilter.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons/faArrowRotateLeft";

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
            distinctLengthFilters: Set<number>
        }) {
            const {activeFilters, setActiveFilters, distinctThicknessFilters, distinctQualityFilters, distinctWidthFilters, distinctLengthFilters} = props;

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
                            { const intervalSet = new Set<IntervalMmClass>();
                            for (const possibleInterval of allFilters.lengthIntervalFilters) {
                                for (const item of value) {
                                    if (possibleInterval.toString() === item) {
                                        intervalSet.add(possibleInterval);
                                    }
                                }
                            }
                            newFilters.lengthIntervalFilters = intervalSet;
                            break; }
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
                        key={filter.toString()}
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
                {filterConfigs.map(config => renderFilterGroup(config))}

                    <button
                        onClick={() => setActiveFilters(SlotFiltersClass.EMPTY)}
                        className="text-[var(--color-text-01)] hover:bg-grey p-2 rounded-lg mt-4 reset-filters-button"
                    >
                        <FontAwesomeIcon icon={faArrowRotateLeft} className="mr-2" />
                        Resetovat všechny filtry
                    </button>
                </div>
            );
        }

        export default Filters;