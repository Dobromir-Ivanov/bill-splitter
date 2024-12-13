export interface Item {
    name: string;
    price: number;
}

export interface Participant {
    name: string;
    selectedItems: Item[];
    amount: number;
}

export interface Bill {
    id: string;
    items: Item[];
    participants: Participant[];
    totalAmount: number;
    paidAmount: number;
    createdAt: Date;
}
