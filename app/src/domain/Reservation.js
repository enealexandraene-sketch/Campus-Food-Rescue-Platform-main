import { ValidationError, InvalidStateError, PickupWindowOverError } from "./errors.js";
import { ReservationStatus } from "./enums.js";

const STATUS_VALUES = Object.values(ReservationStatus);

export class Reservation {
    /**
     * A portion of a listing set aside for one student (UC-8).
     * Created only after listing.assertCanBeReserved() has passed (the service does this).
     *
     * @param {object} data
     * @param {number|null} [data.reservationID]     set when loaded from the database
     * @param {number} data.studentID
     * @param {number} data.listingID
     * @param {string} [data.status=UPCOMING]
     * @param {Date} [data.reservedAt=now]
     * @throws {ValidationError} if studentID, listingID or status is invalid
     */
    constructor({ reservationID = null, studentID, listingID,
                  status = ReservationStatus.UPCOMING, reservedAt = new Date() }) {
        const errors = [];
        if (studentID == null) errors.push("studentID");
        if (listingID == null) errors.push("listingID");
        if (!STATUS_VALUES.includes(status)) errors.push("status");
        if (errors.length > 0) {
            throw new ValidationError(`Invalid or missing fields: ${errors.join(", ")}`, errors);
        }

        this.reservationID = reservationID;
        this.studentID = studentID;
        this.listingID = listingID;
        this.status = status;
        this.reservedAt = reservedAt;
    }

    /** UC-9: the student still has to pick it up. */
    isUpcoming() {
        return this.status === ReservationStatus.UPCOMING;
    }

    /**
     * FR-14: does this reservation take up a portion of the listing?
     * UPCOMING and COLLECTED do; CANCELLED frees the portion again.
     */
    isActive() {
        return this.status === ReservationStatus.UPCOMING
            || this.status === ReservationStatus.COLLECTED;
    }

    /** NFR-7: a student may only cancel their own reservations. */
    isOwnedBy(studentID) {
        return this.studentID === studentID;
    }

    /**
     * UC-10: cancel an upcoming reservation.
     * Takes:         now (Date), pickupEnd (Date) – from provider.pickupWindowOn(listing.createdAt)
     * Can fail with: InvalidStateError (not upcoming), PickupWindowOverError (UC-10 1a)
     * Promises:      status becomes CANCELLED, so the portion counts as free again (FR-14)
     */
    cancel(now, pickupEnd) {
        if (!this.isUpcoming()) {
            throw new InvalidStateError(`Cannot cancel a ${this.status} reservation`);
        }
        if (now >= pickupEnd) throw new PickupWindowOverError();
        this.status = ReservationStatus.CANCELLED;
    }

    /**
     * UC-23: the student picked up the food.
     * Can fail with: InvalidStateError (not upcoming)
     */
    markCollected() {
        if (!this.isUpcoming()) {
            throw new InvalidStateError(`Cannot collect a ${this.status} reservation`);
        }
        this.status = ReservationStatus.COLLECTED;
    }
}
