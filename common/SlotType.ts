
export enum SlotType {
    Beam = "H",
    Jointer = "S"
}

export function toFirestoreCollectionName(slotType: SlotType): string {
    switch (slotType) {
        case SlotType.Beam:
            return "Hranolky";
        case SlotType.Jointer:
            return "Sparovky";
    }
}