import { ChipGroup, ChipItem, useListData, type Selection } from 'actify'
import { SlotFiltersClass } from "../model/SlotFilter.ts";

function Filters(props: {
    activeFilters: SlotFiltersClass,
    setActiveFilters: (value: (((prevState: SlotFiltersClass) => SlotFiltersClass) | SlotFiltersClass)) => void
}) {
    const { activeFilters, setActiveFilters } = props;

    const allFilters = SlotFiltersClass.ALL

    const handleDelete = (filterType: keyof SlotFiltersClass, value: string | number) => {
        setActiveFilters(prevState => {
            const newFilters = new SlotFiltersClass(
                prevState.qualityFilters,
                prevState.thicknessFilters,
                prevState.widthFilters,
                prevState.lengthFilters
            );

            if (Array.isArray(newFilters[filterType])) {
                newFilters[filterType] = (newFilters[filterType] as (string | number)[]).filter((item: string | number) => item !== value);
            }
            return newFilters;
        });
    };

    return (
        <div>
            <h3>Filtry</h3>
            <ChipGroup
                label="Filtr kvality"
                selectionMode="multiple"
            >
            {allFilters.qualityFilters.map((filter) => (
                <ChipItem
                    key={filter}
                >{filter}</ChipItem>
            ))}
            </ChipGroup>
            <ChipGroup
                label="Filtr tloušťky"
                selectionMode="multiple"
            >
            {allFilters.thicknessFilters.map((filter) => (
                <ChipItem
                    key={filter}
                >{filter} mm</ChipItem>
            ))}
            </ChipGroup>
            <ChipGroup
                label="Filtr šířky"
                selectionMode="multiple"
            >
            {allFilters.widthFilters.map((filter) => (
                <ChipItem
                    key={filter}
                >{filter} mm</ChipItem>
            ))}
            </ChipGroup>
            <ChipGroup
                label="Filtr délky"
                selectionMode="multiple"
            >
            {allFilters.lengthFilters.map((filter) => (
                <ChipItem
                    key={`${filter.start}-${filter.end}`}
                >{filter.start} - {filter.end} mm</ChipItem>
            ))}
            </ChipGroup>
        </div>
    );
}

export default Filters;