export interface Reservation {
    id: string;
    userId: string;
    date: Date;
    status: 'pending' | 'confirmed' | 'canceled';
}