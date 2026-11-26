import { Account } from "./Account.js";
import { Role, ProviderStatus } from "./enums.js";
import { ValidationError, InvalidStateError } from "./errors.js";

const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/; // "00:00" to "23:59", always two digits

export class Provider extends Account {
    constructor({ shopName, address, contactInfo,
                status = ProviderStatus.PENDING, rejectionReason = null,
                pickupStart = null, pickupEnd = null, ...accountData }) {

        super(accountData);

        // Check all additional fields
        const errors = [];
        
        if (!shopName?.trim()) errors.push("shopName");
        if (!address?.trim()) errors.push("address");
        
        // TODO: Define clearly what is expected for contactInfo
        if (!contactInfo?.trim()) errors.push("contactInfo");

        if (errors.length > 0) {
            throw new ValidationError(`Invalid or missing fields: ${errors.join(", ")}`, errors);
        }

        // Add Provider specific fields
        this.shopName = shopName.trim();
        this.address = address.trim();
        this.contactInfo = contactInfo.trim();
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.pickupStart = null;
        this.pickupEnd = null;
        if (pickupStart || pickupEnd) this.setPickupWindow(pickupStart, pickupEnd);
    }

    // TODO: Automatically call requestProviderApproval() but only after the shop is saved in DB

    get role() {
        return Role.PROVIDER;
    }

    canLogIn() {
        return this.status === ProviderStatus.APPROVED;
    }

    /** Approve the provider */
    approve() {
        if (this.status !== ProviderStatus.PENDING) {
            throw new InvalidStateError(`Cannot approve a ${this.status} provider`);
        }
        this.status = ProviderStatus.APPROVED;
    }

    /** Reject a provider with a reason */
    reject(reason) {
        if (this.status !== ProviderStatus.PENDING) {
            throw new InvalidStateError(`Cannot reject a ${this.status} provider`);
        }
        if (!reason?.trim()) throw new ValidationError("A reason is required", ["reason"]);
        this.status = ProviderStatus.REJECTED;
        this.rejectionReason = reason.trim();
    }


    /** Returns the pickup window as Dates on the given day (e.g. the listing's creation day). */
    pickupWindowOn(day) {
        if (!this.pickupStart || !this.pickupEnd) {
            throw new InvalidStateError("Pickup window not set");
        }
        const at = (hhmm) => {
            const [h, m] = hhmm.split(":").map(Number);
            const d = new Date(day);
            d.setHours(h, m, 0, 0);
            return d;
        };
        return { start: at(this.pickupStart), end: at(this.pickupEnd) };
    }

    /** UC-16: set the daily pickup window, e.g. ("19:00", "20:00"). */
    setPickupWindow(start, end) {
        if (!TIME_FORMAT.test(start ?? "") || !TIME_FORMAT.test(end ?? "")) {
            throw new ValidationError("Times must be HH:MM", ["pickupStart", "pickupEnd"]);
        }
        if (end <= start) {
            throw new ValidationError("The window must end after it starts", ["pickupEnd"]);
        }
        this.pickupStart = start;
        this.pickupEnd = end;
    }

    /** Check if provider is approved */
    assertCanPublish() {
        if (this.status !== ProviderStatus.APPROVED) {
            throw new InvalidStateError("Only approved shops can publish listings");
        }
        if (!this.pickupStart || !this.pickupEnd) {
            throw new InvalidStateError("Set a pickup window before publishing");
        }
    }

}
