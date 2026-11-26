export const Role = Object.freeze({
    STUDENT: "STUDENT",
    PROVIDER: "PROVIDER",
    MAINTAINER: "MAINTAINER",
});

export const Allergen = Object.freeze({
    NO_ALLERGENS: "NO_ALLERGENS", // must be the only value if chosen (checked in Listing)
    GLUTEN: "GLUTEN",
    CRUSTACEANS: "CRUSTACEANS",
    EGGS: "EGGS",
    FISH: "FISH",
    PEANUTS: "PEANUTS",
    SOY: "SOY",
    MILK: "MILK",
    TREE_NUTS: "TREE_NUTS",
    CELERY: "CELERY",
    MUSTARD: "MUSTARD",
    SESAME: "SESAME",
    SULPHITES: "SULPHITES",
    LUPIN: "LUPIN",
    MOLLUSCS: "MOLLUSCS",
});

export const ReservationStatus = Object.freeze({
    UPCOMING: "UPCOMING",
    COLLECTED: "COLLECTED",
    CANCELLED: "CANCELLED",
    MISSED: "MISSED",
});

export const ListingStatus = Object.freeze({
    ACTIVE: "ACTIVE",
    REMOVED: "REMOVED",
});

export const ProviderStatus = Object.freeze({
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    REMOVED: "REMOVED",
});
