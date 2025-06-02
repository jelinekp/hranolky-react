import {ChipGroup, ChipItem, type Selection} from 'actify'
import {IntervalMmClass, SlotFiltersClass} from "../model/SlotFilter.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons/faArrowRotateLeft";

function Filters(props: {
    activeFilters: SlotFiltersClass,
    setActiveFilters: (value: (((prevState: SlotFiltersClass) => SlotFiltersClass) | SlotFiltersClass)) => void
}) {
    const {activeFilters, setActiveFilters} = props;

    const allFilters = SlotFiltersClass.ALL

    function handleQualityFilterSelect(value: Selection) {

        const valueSet = new Set<string>()
        for (const item of value) {
            valueSet.add(item as string)
        }

        setActiveFilters(prevState => {
                const newFilters = new SlotFiltersClass(
                    prevState.qualityFilters,
                    prevState.thicknessFilters,
                    prevState.widthFilters,
                    prevState.lengthFilters
                )

                newFilters.qualityFilters = valueSet

                return newFilters
            }
        )
    }

    function handleThicknessFilterSelect(value: Selection) {

        const valueSet = new Set<number>()
        for (const item of value) {
            valueSet.add(parseFloat(item as string))
        }

        setActiveFilters(prevState => {
                const newFilters = new SlotFiltersClass(
                    prevState.qualityFilters,
                    prevState.thicknessFilters,
                    prevState.widthFilters,
                    prevState.lengthFilters
                )

                newFilters.thicknessFilters = valueSet

                return newFilters
            }
        )
    }

    function handleWidthFilterSelect(value: Selection) {

        const valueSet = new Set<number>()
        for (const item of value) {
            valueSet.add(parseFloat(item as string))
        }

        setActiveFilters(prevState => {
                const newFilters = new SlotFiltersClass(
                    prevState.qualityFilters,
                    prevState.thicknessFilters,
                    prevState.widthFilters,
                    prevState.lengthFilters
                )

                newFilters.widthFilters = valueSet

                return newFilters
            }
        )
    }

    function handleLengthFilterSelect(value: Selection) {

        const valueSet = new Set<IntervalMmClass>()
        for (const possibleInterval of allFilters.lengthFilters) {
            for (const item of value) {
                if (possibleInterval.toString() === item)
                    valueSet.add(possibleInterval)
            }
        }

        setActiveFilters(prevState => {
                const newFilters = new SlotFiltersClass(
                    prevState.qualityFilters,
                    prevState.thicknessFilters,
                    prevState.widthFilters,
                    prevState.lengthFilters
                )

                newFilters.lengthFilters = valueSet

                return newFilters
            }
        )
    }

    return (
        <div>
            <h3>Filtry</h3>
            <ChipGroup
                label="Filtr kvality"
                selectionMode="multiple"
                selectedKeys={activeFilters.qualityFilters}
                onSelectionChange={handleQualityFilterSelect}
            >
                {Array.from(allFilters.qualityFilters).map((filter) => (
                    <ChipItem
                        key={filter}
                        textValue={filter}
                    >{filter}</ChipItem>
                ))}
            </ChipGroup>
            <ChipGroup
                label="Filtr tloušťky"
                selectionMode="multiple"
                selectedKeys={Array.from(activeFilters.thicknessFilters).map(filter => filter.toString())}
                onSelectionChange={handleThicknessFilterSelect}
            >
                {Array.from(allFilters.thicknessFilters).map((filter) => (
                    <ChipItem
                        key={filter}
                        textValue={filter.toString() + " mm"}
                    >{filter} mm</ChipItem>
                ))}
            </ChipGroup>
            <ChipGroup
                label="Filtr šířky"
                selectionMode="multiple"
                selectedKeys={Array.from(activeFilters.widthFilters).map(filter => filter.toString())}
                onSelectionChange={handleWidthFilterSelect}
            >
                {Array.from(allFilters.widthFilters).map((filter) => (
                    <ChipItem
                        key={filter}
                        textValue={filter.toString() + " mm"}
                    >{filter} mm</ChipItem>
                ))}
            </ChipGroup>
            <ChipGroup
                label="Filtr délky"
                selectionMode="multiple"
                selectedKeys={Array.from(activeFilters.lengthFilters).map(interval => interval.toString())}
                onSelectionChange={handleLengthFilterSelect}
            >
                {Array.from(allFilters.lengthFilters).map((filter) => (
                    <ChipItem
                        key={filter.toString()}
                        textValue={filter.toString() + " mm"}
                    >{filter.toString()} mm</ChipItem>
                ))}
            </ChipGroup>

            <button
                onClick={() => setActiveFilters(SlotFiltersClass.EMPTY)}
                className={"text-[var(--color-text-01)] hover:bg-grey p-2 rounded-lg mt-8 reset-filters-button"}
            >
                <FontAwesomeIcon icon={faArrowRotateLeft} className="mr-2" />
                Resetovat filtry
            </button>
        </div>
    );
}

export default Filters;