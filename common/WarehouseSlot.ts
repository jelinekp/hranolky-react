import { Timestamp } from "firebase/firestore";
import { SlotAction } from "./SlotAction";
import { SlotType } from "./SlotType";
import { getFullQualityName } from "./utils/qualityMapping";
import { ParseSettings, DimensionAdjustments } from "./types/settingsTypes";

/**
 * Default dimension adjustments used when settings are not provided
 */
export const DEFAULT_DIMENSION_ADJUSTMENTS: DimensionAdjustments = {
    "27.0": 27.4,
    "42.0": 42.4,
};

export interface WarehouseSlot {
    productId: string;
    quantity: number;
    slotActions?: SlotAction[];
    type: SlotType;
    quality?: string | null;
    width?: number | null;
    thickness?: number | null;
    length?: number | null;
    lastModified?: Timestamp | null;
}

export class WarehouseSlotClass implements WarehouseSlot {
    productId: string;
    quantity: number;
    slotActions: SlotAction[];
    type: SlotType;
    lastModified?: Timestamp | null;
    quality?: string | null;
    width?: number | null;
    thickness?: number | null;
    length?: number | null;
    lastSlotAction?: string | null = "-";
    lastSlotQuantityChange?: number | null = null;

    constructor(id: string, data: Partial<WarehouseSlot>) {
        this.productId = id || "";
        this.quantity = data.quantity != null ? data.quantity : 0;
        this.slotActions = data.slotActions != null ? data.slotActions : [];
        this.type = data.type != null ? data.type : SlotType.Beam;
        this.lastModified = data.lastModified || null;
        this.quality = data.quality || null;
        this.width = data.width || null;
        this.thickness = data.thickness || null;
        this.length = data.length || null;
    }



    /**
     * Parses properties from the productId string to populate the object's attributes.
     * This logic is a direct translation of the provided Kotlin code.
     * @param settings - Optional settings containing dimension adjustments and quality mappings
     * @returns {WarehouseSlotClass} A new WarehouseSlotClass instance with the parsed properties.
     */
    parsePropertiesFromProductId(settings?: ParseSettings) {
        const initialProductId = this.productId;
        const dimensionAdjustments = settings?.dimensionAdjustments ?? DEFAULT_DIMENSION_ADJUSTMENTS;
        const qualityMappings = settings?.qualityMappings;

        let type = "";
        let processedProductId = initialProductId;

        if (initialProductId.startsWith("H-") || initialProductId.startsWith("S-")) {
            type = initialProductId.substring(0, 1);
            processedProductId = initialProductId.substring(2);
        } else {
            type = "";
            processedProductId = initialProductId;
        }

        const parts = processedProductId.split("-");
        const quality = parts[0] + "-" + parts[1];
        const fullQualityName = getFullQualityName(quality, qualityMappings);

        if (parts.length < 5) {
            console.log(`Could not parse ID "${processedProductId}". Found only ${parts.length} parts.`);
            return this;
        }

        const rawThickness = parseFloat(parts[2]);
        const thicknessKey = rawThickness.toFixed(1);
        const thickness = dimensionAdjustments[thicknessKey] ?? rawThickness;

        const rawWidth = parseFloat(parts[3]);
        const widthKey = rawWidth.toFixed(1);
        const width = dimensionAdjustments[widthKey] ?? rawWidth;

        const length = parseInt(parts[4], 10);

        let slotType: SlotType;
        switch (type) {
            case "H":
                slotType = SlotType.Beam;
                break;
            case "S":
                slotType = SlotType.Jointer;
                break;
            default:
                slotType = SlotType.Beam;
        }

        return new WarehouseSlotClass(this.productId, {
            ...this,
            type: slotType,
            quality: fullQualityName,
            thickness: thickness,
            width: width,
            length: length,
        });
    }


    getVolume(): number | null {
        if (this.width == null || this.thickness == null || this.length == null) {
            return null;
        }
        return ((this.quantity * this.length * this.thickness * this.width) / 1_000_000_000);
    }

    getVolumeDm(): number | null {
        if (this.width == null || this.thickness == null || this.length == null) {
            return null;
        }
        return ((this.quantity * this.length * this.thickness * this.width) / 1_000_000);
    }

    getLastActionString(): string {
        switch (this.lastSlotAction) {
            case "prijem":
                return "Příjem";
            case "vydej":
                return "Výdej";
            case "inventura":
                return "Inventura";
            default:
                return "-";
        }
    }


    hasAllProperties(): boolean {
        return this.quality !== null && this.width !== null && this.thickness !== null && this.length !== null;
    }
}