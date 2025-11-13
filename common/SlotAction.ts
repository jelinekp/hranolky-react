import { Timestamp } from "firebase/firestore";

export interface SlotAction {
    action?: string | null;
    quantityChange: number;
    newQuantity: number;
    userId: string;
    userName: string;
    timestamp?: Timestamp | null;
}

export const defaultSlotAction: SlotAction = {
    action: null,
    quantityChange: 0,
    newQuantity: 0,
    userId: "",
    userName: "",
    timestamp: null
};

export class SlotActionClass implements SlotAction {
    action?: string | null;
    quantityChange: number;
    newQuantity: number;
    userId: string;
    userName: string;
    timestamp?: Timestamp | null;

    constructor(data: Partial<SlotAction>) {
        this.action = data.action || null;
        this.quantityChange = data.quantityChange || 0;
        this.newQuantity = data.newQuantity || 0;
        this.userId = data.userId || "";
        this.userName = data.userName || "";
        this.timestamp = data.timestamp || null;
    }
}