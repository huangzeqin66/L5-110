export interface Reservation {
    id: string;
    userId: string;
    date: Date;
    status: 'pending' | 'confirmed' | 'canceled';
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
}