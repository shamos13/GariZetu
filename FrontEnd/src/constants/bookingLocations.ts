export interface BookingLocation {
    id: number;
    name: string;
    address: string;
}

export const BOOKING_LOCATIONS: BookingLocation[] = [
    { id: 1, name: "Nairobi CBD", address: "Kenyatta Avenue, Nairobi" },
    { id: 2, name: "JKIA Airport", address: "Jomo Kenyatta International Airport" },
    { id: 3, name: "Westlands", address: "Westlands, Nairobi" },
    { id: 4, name: "Karen", address: "Karen, Nairobi" },
    { id: 5, name: "Wilson Airport", address: "Wilson Airport, Langata" },
];

const normalizeText = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, " ");

export const isValidBookingLocationId = (value: number): boolean =>
    BOOKING_LOCATIONS.some((location) => location.id === value);

export const parseBookingLocationIdParam = (value: string | null): number | null => {
    if (!value) {
        return null;
    }

    const parsedValue = Number.parseInt(value, 10);
    if (Number.isNaN(parsedValue) || !isValidBookingLocationId(parsedValue)) {
        return null;
    }

    return parsedValue;
};

export const resolveBookingLocationIdByQuery = (query: string | null): number | null => {
    if (!query) {
        return null;
    }

    const normalizedQuery = normalizeText(query);

    const matchedLocation = BOOKING_LOCATIONS.find((location) => {
        const fullLabel = `${location.name} - ${location.address}`;

        return (
            normalizeText(location.name) === normalizedQuery ||
            normalizeText(location.address) === normalizedQuery ||
            normalizeText(fullLabel) === normalizedQuery
        );
    });

    return matchedLocation ? matchedLocation.id : null;
};
