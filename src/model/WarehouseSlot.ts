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

    parsePropertiesFromProductId(): WarehouseSlotClass {
        const quality = this.productId.substring(0, 5);
        const parts = this.productId.split("-");

        if (parts.length < 5) {
            console.log(`Parsed parts: ${parts.length}`);
        } else {
            const rawThickness = parseFloat(parts[2]);
            const thickness =
                rawThickness === 20.0
                    ? 20.0
                    : rawThickness === 27.0
                        ? 27.4
                        : rawThickness === 42.0
                            ? 42.4
                            : rawThickness;

            const rawWidth = parseFloat(parts[3]);
            const width = rawWidth === 42.0 ? 42.4 : rawWidth;

            const length = parseInt(parts[4], 10);

            return new WarehouseSlotClass(this.productId,{
                ...this,
                quality,
                thickness,
                width,
                length,
            });
        }
        return this;
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