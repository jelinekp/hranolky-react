interface IntervalMm {
    start: number
    end: number
}

export class IntervalMmClass implements IntervalMm {
    start: number
    end: number

    constructor(start: number, end: number) {
        this.start = start
        this.end = end
    }

    contains(value: number | null): boolean {
        if (value === null) {
            return false
        }
        return value >= this.start && value <= this.end
    }

    toString(): string {
        return `${this.start} - ${this.end}`
    }
}

interface SlotFilters {
    qualityFilters: Set<string>
    thicknessFilters: Set<number>
    widthFilters: Set<number>
    lengthFilters: Set<IntervalMmClass>
}

export class SlotFiltersClass implements SlotFilters {
    qualityFilters: Set<string>
    thicknessFilters: Set<number>
    widthFilters: Set<number>
    lengthFilters: Set<IntervalMmClass>

    static EMPTY: SlotFiltersClass = new SlotFiltersClass(new Set(), new Set(), new Set(), new Set());
    static ALL: SlotFiltersClass = new SlotFiltersClass(
        new Set(["DUB-A", "DUB-R"]),
        new Set([20, 27.4, 42.4]),
        new Set([42.4, 50, 70]),
        new Set([
            { start: 0, end: 999 },
            { start: 1000, end: 1999 },
            { start: 2000, end: 2999 }
        ])
    );

    constructor(
        qualityFilters: Set<string>,
        thicknessFilters: Set<number>,
        widthFilters: Set<number>,
        lengthFilters: Set<({ start: number; end: number })>
    ) {
        this.qualityFilters = qualityFilters
        this.thicknessFilters = thicknessFilters
        this.widthFilters = widthFilters
        this.lengthFilters = new Set(Array.from(lengthFilters).map(interval => new IntervalMmClass(interval.start, interval.end)))
    }

    isEmpty(): boolean {
        return (
            this.qualityFilters.size === 0 &&
            this.thicknessFilters.size === 0 &&
            this.widthFilters.size === 0 &&
            this.lengthFilters.size === 0
        );
    }

    hasQualityFilters(): boolean {
        return this.qualityFilters.size > 0
    }

    hasThicknessFilters(): boolean {
        return this.thicknessFilters.size > 0
    }

    hasWidthFilters(): boolean {
        return this.widthFilters.size > 0
    }

    hasLengthFilters(): boolean {
        return this.lengthFilters.size > 0
    }

    getNumberOfActiveFilters(): number {
        return (
            this.qualityFilters.size +
            this.thicknessFilters.size +
            this.widthFilters.size +
            this.lengthFilters.size
        )
    }
}