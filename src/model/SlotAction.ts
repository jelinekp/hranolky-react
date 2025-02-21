import { Timestamp } from "firebase/firestore";

export interface SlotAction {
    action?: string | null;
    quantityChange: number;
    newQuantity: number;
    timestamp?: Timestamp | null;
}

export const defaultSlotAction: SlotAction = {
    action: null,
    quantityChange: 0,
    newQuantity: 0,
    timestamp: null
};

export class SlotActionClass implements SlotAction {
    action?: string | null;
    quantityChange: number;
    newQuantity: number;
    timestamp?: Timestamp | null;

    constructor(data: Partial<SlotAction>) {
        this.action = data.action || null;
        this.quantityChange = data.quantityChange || 0;
        this.newQuantity = data.newQuantity || 0;
        this.timestamp = data.timestamp || null;
    }
}