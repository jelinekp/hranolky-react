import { Timestamp } from "firebase/firestore";
import { SlotAction } from "./SlotAction";
import { SlotType } from "./SlotType";


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
     * @returns {WarehouseSlotClass} A new WarehouseSlotClass instance with the parsed properties.
     */
    parsePropertiesFromProductId() {
        const initialProductId = this.productId;

        let type = "";
        let processedProductId = initialProductId;

        // Determine the type and update productId, mirroring the Kotlin logic.
        // If the ID starts with "H" or "S", we extract it as the type and
        // remove the prefix (e.g., "H-") from the ID string before parsing.
        if (initialProductId.startsWith("H-") || initialProductId.startsWith("S-")) {
            type = initialProductId.substring(0, 1);
            processedProductId = initialProductId.substring(2);
        } else {
            // No type prefix, so type is empty and product ID remains unchanged
            type = "";
            processedProductId = initialProductId;
        }


        // Extract quality and split parts from the potentially modified product ID
        const quality = processedProductId.substring(0, 5);
        const parts = processedProductId.split("-");

        if (parts.length < 5) {
            console.log(`Could not parse ID "${processedProductId}". Found only ${parts.length} parts.`);
            return this; // Return the original object if parsing fails
        }

        // --- Value Parsing and Mapping ---

        // Map thickness based on specific raw values
        const rawThickness = parseFloat(parts[2]);
        let thickness;
        switch (rawThickness) {
            case 20.0:
                thickness = 20.0;
                break;
            case 27.0:
                thickness = 27.4;
                break;
            case 42.0:
                thickness = 42.4;
                break;
            default:
                thickness = rawThickness;
        }

        // Map width based on specific raw values
        const rawWidth = parseFloat(parts[3]);
        const width = rawWidth === 42.0 ? 42.4 : rawWidth;

        const length = parseInt(parts[4], 10);

        // Determine slot type from the prefix we found earlier
        let slotType;
        switch (type) {
            case "H":
                slotType = "Beam"; // Corresponds to SlotType.Beam
                break;
            case "S":
                slotType = "Jointer"; // Corresponds to SlotType.Jointer
                break;
            default:
                slotType = "Beam"; // Default type if no prefix
        }

        // Create a new instance with all the original and updated properties
        return new WarehouseSlotClass(this.productId, {
            ...this,
            slotType: slotType,
            quality: quality,
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

    hasAllProperties(): boolean {
        return this.quality !== null && this.width !== null && this.thickness !== null && this.length !== null;
    }
}