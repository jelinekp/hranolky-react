class ActiveFilters {
    qualityFilters: string[];
    thicknessFilters: number[];
    widthFilters: number[];
    lengthFilters: number[];
    quantityFilters: number[];
    volumeFilters: number[];
    lastModifiedFilters: Date[];

    constructor() {
        this.qualityFilters = [];
        this.thicknessFilters = [];
        this.widthFilters = [];
        this.lengthFilters = [];
        this.quantityFilters = [];
        this.volumeFilters = [];
        this.lastModifiedFilters = [];
    }
}

interface IntervalMm {
    start: number;
    end: number;
}

export class IntervalMmClass implements IntervalMm {
    start: number;
    end: number;

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }

    contains(value: number | null): boolean {
        if (value === null) {
            return false;
        }
        return value >= this.start && value <= this.end;
    }

    toString(): string {
        return `${this.start} - ${this.end}`;
    }
}

interface SlotFilters {
    qualityFilters: string[];
    thicknessFilters: number[];
    widthFilters: number[];
    lengthFilters: IntervalMmClass[];
}

export class SlotFiltersClass implements SlotFilters {
    qualityFilters: string[];
    thicknessFilters: number[];
    widthFilters: number[];
    lengthFilters: IntervalMmClass[];

    static EMPTY: SlotFiltersClass = new SlotFiltersClass([], [], [], []);
    static ALL: SlotFiltersClass = new SlotFiltersClass(
        ["DUB-A", "DUB-R"],
        [20, 27.4, 42.4],
        [42.4, 50, 70],
        [
            { start: 0, end: 999 },
            { start: 1000, end: 1999 },
            { start: 2000, end: 2999 }
        ]
    );

    constructor(
        qualityFilters: string[],
        thicknessFilters: number[],
        widthFilters: number[],
        lengthFilters: ({ start: number; end: number })[]
    ) {
        this.qualityFilters = qualityFilters;
        this.thicknessFilters = thicknessFilters;
        this.widthFilters = widthFilters;
        this.lengthFilters = lengthFilters.map(interval => new IntervalMmClass(interval.start, interval.end));
    }

    isEmpty(): boolean {
        return (
            this.qualityFilters.length === 0 &&
            this.thicknessFilters.length === 0 &&
            this.widthFilters.length === 0 &&
            this.lengthFilters.length === 0
        );
    }

    hasQualityFilters(): boolean {
        return this.qualityFilters.length > 0;
    }

    hasThicknessFilters(): boolean {
        return this.thicknessFilters.length > 0;
    }

    hasWidthFilters(): boolean {
        return this.widthFilters.length > 0;
    }

    hasLengthFilters(): boolean {
        return this.lengthFilters.length > 0;
    }

    getNumberOfActiveFilters(): number {
        return (
            this.qualityFilters.length +
            this.thicknessFilters.length +
            this.widthFilters.length +
            this.lengthFilters.length
        );
    }
}