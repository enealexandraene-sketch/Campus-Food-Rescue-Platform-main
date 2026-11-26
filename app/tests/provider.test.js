import { test } from "node:test";
import assert from "node:assert/strict";
import { Provider } from "../src/domain/Provider.js";
import { ValidationError, InvalidStateError } from "../src/domain/errors.js";

const valid = {
    name: "Anna",
    email: "anna@restopolis.lu",
    passwordHash: "hash",
    shopName: "Cafeteria Belval",
    address: "Maison du Savoir, Esch-sur-Alzette",
    contactInfo: "+352 123 456",
};

const make = (overrides = {}) => new Provider({ ...valid, ...overrides });

// ---------- Creation (UC-15) ----------

test("UC-15: new provider is PENDING with the PROVIDER role", () => {
    const p = make();
    assert.equal(p.status, "PENDING");
    assert.equal(p.role, "PROVIDER");
    assert.equal(p.rejectionReason, null);
});

test("UC-15: non-university email is accepted for providers", () => {
    assert.equal(make().email, "anna@restopolis.lu");
});

test("UC-15: shop fields are trimmed", () => {
    const p = make({ shopName: "  Cafeteria Belval ", address: " MSA ", contactInfo: " 123 " });
    assert.equal(p.shopName, "Cafeteria Belval");
    assert.equal(p.address, "MSA");
    assert.equal(p.contactInfo, "123");
});

test("UC-15 2a: all missing shop fields are reported at once", () => {
    assert.throws(
        () => make({ shopName: "", address: "  ", contactInfo: undefined }),
        (err) => err instanceof ValidationError
              && err.fields.join() === "shopName,address,contactInfo"
    );
});

test("UC-15: account fields are still validated by Account", () => {
    assert.throws(() => make({ email: "not-an-email" }), ValidationError);
});

test("new provider has no pickup window yet", () => {
    const p = make();
    assert.equal(p.pickupStart, null);
    assert.equal(p.pickupEnd, null);
});

// ---------- Loading from the database ----------

test("provider loaded as APPROVED stays approved", () => {
    const p = make({ accountID: 3, status: "APPROVED" });
    assert.equal(p.status, "APPROVED");
    assert.equal(p.accountID, 3);
});

test("provider loaded with a pickup window keeps it", () => {
    const p = make({ pickupStart: "19:00", pickupEnd: "20:00" });
    assert.equal(p.pickupStart, "19:00");
    assert.equal(p.pickupEnd, "20:00");
});

test("provider loaded with an invalid pickup window is refused", () => {
    assert.throws(() => make({ pickupStart: "20:00", pickupEnd: "19:00" }), ValidationError);
    assert.throws(() => make({ pickupStart: "19:00" }), ValidationError);
});

// ---------- Log in (UC-2, FR-7) ----------

test("FR-7: pending provider cannot log in", () => {
    assert.equal(make().canLogIn(), false);
});

test("FR-7: approved provider can log in", () => {
    const p = make();
    p.approve();
    assert.equal(p.canLogIn(), true);
});

test("FR-7: rejected provider cannot log in", () => {
    const p = make();
    p.reject("Not a campus shop");
    assert.equal(p.canLogIn(), false);
});

// ---------- Approve / reject (UC-25) ----------

test("UC-25: pending provider can be approved", () => {
    const p = make();
    p.approve();
    assert.equal(p.status, "APPROVED");
});

test("UC-25: provider cannot be approved twice", () => {
    const p = make();
    p.approve();
    assert.throws(() => p.approve(), InvalidStateError);
});

test("UC-25 3a: rejection stores the trimmed reason", () => {
    const p = make();
    p.reject("  Not a campus shop ");
    assert.equal(p.status, "REJECTED");
    assert.equal(p.rejectionReason, "Not a campus shop");
});

test("UC-25 3a: rejection without a reason is refused and changes nothing", () => {
    const p = make();
    assert.throws(() => p.reject("   "), ValidationError);
    assert.throws(() => p.reject(), ValidationError);
    assert.equal(p.status, "PENDING");
});

test("UC-25: approved provider cannot be rejected", () => {
    const p = make();
    p.approve();
    assert.throws(() => p.reject("Too late"), InvalidStateError);
    assert.equal(p.status, "APPROVED");
});

test("UC-25: rejected provider cannot be approved", () => {
    const p = make();
    p.reject("Not a campus shop");
    assert.throws(() => p.approve(), InvalidStateError);
});

// ---------- Pickup window (UC-16) ----------

test("UC-16: valid pickup window is saved", () => {
    const p = make();
    p.setPickupWindow("19:00", "20:00");
    assert.equal(p.pickupStart, "19:00");
    assert.equal(p.pickupEnd, "20:00");
});

test("UC-16 2a: end before or equal to start is refused", () => {
    const p = make();
    assert.throws(() => p.setPickupWindow("20:00", "19:00"), ValidationError);
    assert.throws(() => p.setPickupWindow("19:00", "19:00"), ValidationError);
});

test("UC-16: badly formatted times are refused", () => {
    const p = make();
    for (const [start, end] of [["7pm", "8pm"], ["9:00", "10:00"], ["24:00", "23:00"], ["19:60", "20:00"], [null, "20:00"]]) {
        assert.throws(() => p.setPickupWindow(start, end), ValidationError, `${start}-${end}`);
    }
});

test("UC-16: a refused change keeps the previous window", () => {
    const p = make();
    p.setPickupWindow("19:00", "20:00");
    assert.throws(() => p.setPickupWindow("21:00", "20:00"), ValidationError);
    assert.equal(p.pickupStart, "19:00");
    assert.equal(p.pickupEnd, "20:00");
});

test("pickupWindowOn returns the window as Dates on the given day", () => {
    const p = make({ pickupStart: "19:00", pickupEnd: "20:30" });
    const day = new Date(2026, 10, 16, 10, 15); // 16 November 2026, 10:15 local time
    const { start, end } = p.pickupWindowOn(day);

    assert.equal(start.getDate(), 16);
    assert.equal(start.getHours(), 19);
    assert.equal(start.getMinutes(), 0);
    assert.equal(end.getHours(), 20);
    assert.equal(end.getMinutes(), 30);
    assert.equal(day.getHours(), 10, "the given day must not be changed");
});

test("pickupWindowOn without a window throws InvalidStateError", () => {
    assert.throws(() => make().pickupWindowOn(new Date()), InvalidStateError);
});
