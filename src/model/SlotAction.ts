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