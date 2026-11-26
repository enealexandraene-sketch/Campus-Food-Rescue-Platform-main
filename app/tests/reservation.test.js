import { test } from "node:test";
import assert from "node:assert/strict";
import { Reservation } from "../src/domain/Reservation.js";
import { ValidationError, InvalidStateError, PickupWindowOverError } from "../src/domain/errors.js";

const pickupEnd = new Date(2026, 10, 16, 20, 0);   // 16 November 2026, 20:00
const before = new Date(2026, 10, 16, 19, 30);
const after = new Date(2026, 10, 16, 20, 30);

const make = (overrides = {}) => new Reservation({ studentID: 1, listingID: 2, ...overrides });

// ---------- Creation (UC-8) ----------

test("UC-8: new reservation is upcoming with defaults", () => {
    const r = make();
    assert.equal(r.reservationID, null);
    assert.equal(r.status, "UPCOMING");
    assert.ok(r.reservedAt instanceof Date);
    assert.equal(r.isUpcoming(), true);
});

test("missing student and listing are reported at once", () => {
    assert.throws(
        () => new Reservation({}),
        (err) => err instanceof ValidationError && err.fields.join() === "studentID,listingID"
    );
});

test("reservation loaded from the database keeps its values", () => {
    const reservedAt = new Date(2026, 10, 16, 12, 0);
    const r = make({ reservationID: 7, status: "COLLECTED", reservedAt });
    assert.equal(r.reservationID, 7);
    assert.equal(r.status, "COLLECTED");
    assert.equal(r.reservedAt, reservedAt);
});

test("unknown status is refused", () => {
    assert.throws(() => make({ status: "UPCOMMING" }), ValidationError);
});

// ---------- isActive (FR-14) ----------

test("FR-14: upcoming and collected reservations take up a portion", () => {
    assert.equal(make().isActive(), true);
    assert.equal(make({ status: "COLLECTED" }).isActive(), true);
});

test("FR-14: cancelled reservation frees the portion", () => {
    assert.equal(make({ status: "CANCELLED" }).isActive(), false);
});

// ---------- isOwnedBy (NFR-7) ----------

test("NFR-7: isOwnedBy only matches the reservation's student", () => {
    assert.equal(make({ studentID: 1 }).isOwnedBy(1), true);
    assert.equal(make({ studentID: 1 }).isOwnedBy(2), false);
});

// ---------- cancel (UC-10) ----------

test("UC-10: can cancel before the window ends", () => {
    const r = make();
    r.cancel(before, pickupEnd);
    assert.equal(r.status, "CANCELLED");
    assert.equal(r.isActive(), false);
});

test("UC-10 1a: cannot cancel after the window ends", () => {
    const r = make();
    assert.throws(() => r.cancel(after, pickupEnd), PickupWindowOverError);
    assert.equal(r.status, "UPCOMING");
});

test("UC-10 1a: cannot cancel exactly at the end of the window", () => {
    assert.throws(() => make().cancel(pickupEnd, pickupEnd), PickupWindowOverError);
});

test("cannot cancel twice", () => {
    const r = make();
    r.cancel(before, pickupEnd);
    assert.throws(() => r.cancel(before, pickupEnd), InvalidStateError);
});

test("collected reservation cannot be cancelled", () => {
    const r = make();
    r.markCollected();
    assert.throws(() => r.cancel(before, pickupEnd), InvalidStateError);
    assert.equal(r.status, "COLLECTED");
});

// ---------- markCollected (UC-23) ----------

test("UC-23: upcoming reservation can be marked as collected", () => {
    const r = make();
    r.markCollected();
    assert.equal(r.status, "COLLECTED");
    assert.equal(r.isUpcoming(), false);
});

test("UC-23: cannot collect twice", () => {
    const r = make();
    r.markCollected();
    assert.throws(() => r.markCollected(), InvalidStateError);
});

test("UC-23: cancelled reservation cannot be collected", () => {
    const r = make();
    r.cancel(before, pickupEnd);
    assert.throws(() => r.markCollected(), InvalidStateError);
    assert.equal(r.status, "CANCELLED");
});
