import { ValidationError, InvalidStateError, ListingUnavailableError,
         NoPortionsLeftError, PickupWindowOverError } from "./errors.js";
import { Allergen, ListingStatus } from "./enums.js";

const ALLERGEN_VALUES = Object.values(Allergen);

export class Listing {
    /**
     * @param {object} data
     * @param {number|null} [data.listingID]       set when loaded from the database
     * @param {number} data.providerID             the shop that offers it
     * @param {string} data.foodName
     * @param {string|null} [data.description]
     * @param {AllergenValue[]} data.allergens     at least one; NO_ALLERGENS must be alone (FR-26)
     * @param {number} data.quantity               whole number ≥ 1
     * @param {string} [data.status=ACTIVE]
     * @param {number} [data.reservedPortions=0]   computed by the repository
     * @param {Date} [data.createdAt=now]
     * @throws {ValidationError} with the names of all invalid fields
     */
    constructor({ listingID = null, providerID, foodName, description = null, allergens, quantity,
        status = ListingStatus.ACTIVE, reservedPortions = 0, createdAt = new Date() }) {

        // Check if all expected fields are given
        const errors = Listing.#validate({ foodName, allergens, quantity });
        if (errors.length > 0) {
            throw new ValidationError(`Invalid or missing fields: ${errors.join(", ")}`, errors);
        }

        this.listingID = listingID;
        this.providerID = providerID;
        this.foodName = foodName.trim();
        this.description = description?.trim() || null;
        this.allergens = [...new Set(allergens)]; // removes duplicates, copies the array
        this.quantity = quantity;
        this.status = status;
        this.reservedPortions = reservedPortions;
        this.createdAt = createdAt;
    }

    /**
     * Checks the fields a provider fills in. Used by the constructor and update().
     * Returns the names of the invalid fields (empty array if all are valid).
     */
    static #validate({ foodName, allergens, quantity }) {
        const errors = [];

        // Check if foodName is empty, missing, or contains only spaces
        if (!foodName?.trim()) errors.push("foodName");

        if (!Array.isArray(allergens) || allergens.length === 0) {
            errors.push("allergens");                     // FR-26: mandatory
        } else if (!allergens.every((a) => ALLERGEN_VALUES.includes(a))) {
            errors.push("allergens");                     // unknown value
        } else if (allergens.includes(Allergen.NO_ALLERGENS) && allergens.length > 1) {
            errors.push("allergens");                     // "no allergens" + another one
        }

        // Check if the quantity is not a number or less than one
        if (!Number.isInteger(quantity) || quantity < 1) errors.push("quantity");

        return errors;
    }

    // Provider can only change their listings
    isOwnedBy(providerID) {
        return this.providerID === providerID;
    }

    /**
     * UC-21: soft delete, so the reservation history stays.
     * Can fail with: InvalidStateError (already removed)
     */
    remove() {
        if (this.status === ListingStatus.REMOVED) {
            throw new InvalidStateError("Listing already removed");
        }
        this.status = ListingStatus.REMOVED;
    }

    /** Compute the remaining portions (according to class diagram) */
    get remainingPortions() {
        return Math.max(0, this.quantity - this.reservedPortions);
    }

    // False means "fully reserved"
    hasPortionsLeft() {
        return this.remainingPortions > 0;
    }

    /**
     * UC-8: can a student reserve a portion right now?
     * Takes:         now (Date), pickupEnd (Date) – from provider.pickupWindowOn(this.createdAt)
     * Can fail with: ListingUnavailableError (removed, UC-7 2a), NoPortionsLeftError (3a),
     *                PickupWindowOverError (3c)
     */
    assertCanBeReserved(now, pickupEnd) {
        if (this.status === ListingStatus.REMOVED) throw new ListingUnavailableError();
        if (!this.hasPortionsLeft()) throw new NoPortionsLeftError();
        if (now >= pickupEnd) throw new PickupWindowOverError();
    }

    /**
     * UC-20: change the listing's details. Fields not given keep their current value.
     * Takes:         { foodName?, description?, allergens?, quantity? }
     * Can fail with: InvalidStateError (removed),
     *                ValidationError (invalid fields, or quantity below the portions
     *                already reserved: UC-20 3b, FR-29)
     * Promises:      if it fails, nothing is changed
     */
    update({ foodName = this.foodName, description = this.description,
             allergens = this.allergens, quantity = this.quantity } = {}) {
        if (this.status === ListingStatus.REMOVED) {
            throw new InvalidStateError("A removed listing can't be edited");
        }

        const errors = Listing.#validate({ foodName, allergens, quantity });
        if (!errors.includes("quantity") && quantity < this.reservedPortions) {
            errors.push("quantity");                      // FR-29
        }
        if (errors.length > 0) {
            throw new ValidationError(`Invalid or missing fields: ${errors.join(", ")}`, errors);
        }

        this.foodName = foodName.trim();
        this.description = description?.trim() || null;
        this.allergens = [...new Set(allergens)];
        this.quantity = quantity;
    }
}
