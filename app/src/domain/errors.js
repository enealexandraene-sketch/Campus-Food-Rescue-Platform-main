export class DomainError extends Error {
    constructor(code, message){
        super(message);
        this.name = this.constructor.name;
        this.code = code; // Should be matched to an HTTP status
    }
}

// ValidationError: any invalid input (missing fields, quantity <1, no allergens,...)
export class ValidationError extends DomainError {
    constructor(message, fields = []){
        super('VALIDATION', message);
        this.fields = fields;
    }
}

// InvalidStateError: any action not allowed in the current object state (cancelling collected reservation, approving a rejected shop)
export class InvalidStateError extends DomainError {
    constructor(message){
        super('INVALID_STATE', message);
    }
}

// PickupWindowOverError: the pickup window has already ended
export class PickupWindowOverError extends DomainError {
    constructor(){
        super('PICKUP_WINDOW_OVER', 'The pickup window has ended'); 
    }
}

// NoPortionLeftError: every portion of the listing is reserved
export class NoPortionsLeftError extends DomainError {
    constructor(){
        super('NO_PORTIONS_LEFT', 'No portions left'); 
    }
}

// ListingUnavailableError: the listing was removed
export class ListingUnavailableError extends DomainError {
    constructor(){
        super('LISTING_UNAVAILABLE', 'This listing is no longer available');
    }
}
