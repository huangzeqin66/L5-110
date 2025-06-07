export class ReservationService {
    private reservations: any[] = [];

    addReservation(reservation: any) {
        this.reservations.push(reservation);
    }

    getReservations() {
        return this.reservations;
    }

    removeReservation(reservationId: number) {
        this.reservations = this.reservations.filter(reservation => reservation.id !== reservationId);
    }
}