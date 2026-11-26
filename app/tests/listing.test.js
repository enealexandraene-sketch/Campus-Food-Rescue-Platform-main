import { test } from "node:test";
import assert from "node:assert/strict";
import { Listing } from "../src/domain/Listing.js";
import { ValidationError, InvalidStateError, ListingUnavailableError,
         NoPortionsLeftError, PickupWindowOverError } from "../src/domain/errors.js";

const valid = { providerID: 1, foodName: "Pasta", allergens: ["GLUTEN"], quantity: 3 };
const make = (overrides = {}) => new Listing({ ...valid, ...overrides });

const pickupEnd = new Date(2026, 10, 16, 20, 0);   // 16 November 2026, 20:00
const before = new Date(2026, 10, 16, 19, 30);
const after = new Date(2026, 10, 16, 20, 30);

// ---------- Constructor (UC-17, FR-26) ----------

test("valid listing gets its defaults", () => {
    const l = make();
    assert.equal(l.listingID, null);
    assert.equal(l.status, "ACTIVE");
    assert.equal(l.reservedPortions, 0);
    assert.ok(l.createdAt instanceof Date);
});

test("text fields are trimmed; empty description becomes null", () => {
    const l = make({ foodName: "  Pasta ", description: "  With pesto " });
    assert.equal(l.foodName, "Pasta");
    assert.equal(l.description, "With pesto");
    assert.equal(make().description, null);
    assert.equal(make({ description: "   " }).description, null);
});

test("quantity of 1 is accepted", () => {
    assert.equal(make({ quantity: 1 }).quantity, 1);
});

test("duplicate allergens are removed and the caller's array is copied", () => {
    const allergens = ["EGGS", "EGGS", "MILK"];
    const l = make({ allergens });
    assert.deepEqual(l.allergens, ["EGGS", "MILK"]);
    allergens.push("FISH");
    assert.deepEqual(l.allergens, ["EGGS", "MILK"]);
});

test("NO_ALLERGENS alone is accepted", () => {
    assert.deepEqual(make({ allergens: ["NO_ALLERGENS"] }).allergens, ["NO_ALLERGENS"]);
});

test("FR-26: invalid allergens are refused", () => {
    for (const allergens of [[], undefined, "GLUTEN", ["PIZZA"], ["gluten"], ["NO_ALLERGENS", "GLUTEN"]]) {
        assert.throws(() => make({ allergens }), ValidationError, JSON.stringify(allergens));
    }
});

test("invalid quantities are refused", () => {
    for (const quantity of [0, -2, 1.5, "3", undefined, NaN]) {
        assert.throws(() => make({ quantity }), ValidationError, String(quantity));
    }
});

test("UC-17 2a: all invalid fields are reported at once", () => {
    assert.throws(
        () => make({ foodName: " ", allergens: [], quantity: 0 }),
        (err) => err instanceof ValidationError && err.fields.join() === "foodName,allergens,quantity"
    );
});

test("listing loaded from the database keeps its values", () => {
    const createdAt = new Date(2026, 10, 15, 10, 0);
    const l = make({ listingID: 9, status: "REMOVED", reservedPortions: 2, createdAt });
    assert.equal(l.listingID, 9);
    assert.equal(l.status, "REMOVED");
    assert.equal(l.reservedPortions, 2);
    assert.equal(l.createdAt, createdAt);
});

// ---------- Portions (FR-14) ----------

test("remainingPortions = quantity - reserved", () => {
    const l = make({ quantity: 3, reservedPortions: 1 });
    assert.equal(l.remainingPortions, 2);
    assert.equal(l.hasPortionsLeft(), true);
});

test("UC-18 3a: fully reserved listing has no portions left", () => {
    const l = make({ quantity: 3, reservedPortions: 3 });
    assert.equal(l.remainingPortions, 0);
    assert.equal(l.hasPortionsLeft(), false);
});

test("remainingPortions is never negative", () => {
    assert.equal(make({ quantity: 2, reservedPortions: 5 }).remainingPortions, 0);
});

// ---------- assertCanBeReserved (UC-8) ----------

test("UC-8: active listing with portions can be reserved before the window ends", () => {
    assert.doesNotThrow(() => make().assertCanBeReserved(before, pickupEnd));
});

test("UC-7 2a: removed listing cannot be reserved", () => {
    assert.throws(() => make({ status: "REMOVED" }).assertCanBeReserved(before, pickupEnd), ListingUnavailableError);
});

test("UC-8 3a: fully reserved listing cannot be reserved", () => {
    assert.throws(() => make({ reservedPortions: 3 }).assertCanBeReserved(before, pickupEnd), NoPortionsLeftError);
});

test("UC-8 3c: listing cannot be reserved after the window ends", () => {
    assert.throws(() => make().assertCanBeReserved(after, pickupEnd), PickupWindowOverError);
});

test("UC-8 3c: listing cannot be reserved exactly at the end of the window", () => {
    assert.throws(() => make().assertCanBeReserved(pickupEnd, pickupEnd), PickupWindowOverError);
});

// ---------- update (UC-20, FR-29) ----------

test("UC-20: update changes the given fields", () => {
    const l = make();
    l.update({ foodName: " Lasagna ", description: "Veggie", allergens: ["GLUTEN", "MILK"], quantity: 5 });
    assert.equal(l.foodName, "Lasagna");
    assert.equal(l.description, "Veggie");
    assert.deepEqual(l.allergens, ["GLUTEN", "MILK"]);
    assert.equal(l.quantity, 5);
});

test("UC-20: fields not given keep their value", () => {
    const l = make({ description: "With pesto" });
    l.update({ quantity: 10 });
    assert.equal(l.foodName, "Pasta");
    assert.equal(l.description, "With pesto");
    assert.deepEqual(l.allergens, ["GLUTEN"]);
    assert.equal(l.quantity, 10);
});

test("UC-20 3b / FR-29: quantity cannot go below reserved portions", () => {
    const l = make({ quantity: 5, reservedPortions: 3 });
    assert.throws(() => l.update({ quantity: 2 }), ValidationError);
    assert.doesNotThrow(() => l.update({ quantity: 3 }));
});

test("UC-20 3a: invalid update is refused and changes nothing", () => {
    const l = make();
    assert.throws(
        () => l.update({ foodName: "New name", allergens: [] }),
        (err) => err instanceof ValidationError && err.fields.join() === "allergens"
    );
    assert.equal(l.foodName, "Pasta");
    assert.deepEqual(l.allergens, ["GLUTEN"]);
});

test("removed listing cannot be updated", () => {
    assert.throws(() => make({ status: "REMOVED" }).update({ quantity: 4 }), InvalidStateError);
});

// ---------- remove / isOwnedBy (UC-21, NFR-7) ----------

test("UC-21: remove sets the status to REMOVED", () => {
    const l = make();
    l.remove();
    assert.equal(l.status, "REMOVED");
});

test("UC-21: removing twice throws InvalidStateError", () => {
    const l = make();
    l.remove();
    assert.throws(() => l.remove(), InvalidStateError);
});

test("NFR-7: isOwnedBy only matches the listing's provider", () => {
    const l = make({ providerID: 1 });
    assert.equal(l.isOwnedBy(1), true);
    assert.equal(l.isOwnedBy(2), false);
});
