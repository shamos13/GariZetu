import type { Car, CarAvailabilityStatus } from "../data/cars";

const STATUS_LABELS: Record<CarAvailabilityStatus, string> = {
    available: "Available",
    soft_locked: "Soft Lock",
    booked: "Booked",
    maintenance: "Maintenance",
};

export const getCarAvailabilityStatus = (
    car: Pick<Car, "availabilityStatus" | "status">
): CarAvailabilityStatus => {
    if (car.availabilityStatus) {
        return car.availabilityStatus;
    }

    if (car.status === "maintenance") {
        return "maintenance";
    }
    if (car.status === "rented") {
        return "booked";
    }
    return "available";
};

export const isCarBookable = (car: Pick<Car, "availabilityStatus" | "status">): boolean =>
    getCarAvailabilityStatus(car) === "available";

export const getAvailabilityLabel = (status: CarAvailabilityStatus): string => STATUS_LABELS[status];

export const getAvailabilityBadgeLabel = (
    car: Pick<Car, "availabilityStatus" | "status" | "softLockExpiresAt">,
    softLockCountdown?: string | null
): string => {
    const status = getCarAvailabilityStatus(car);
    if (status !== "soft_locked") {
        return getAvailabilityLabel(status);
    }

    const countdownLabel = softLockCountdown ?? formatTimeRemaining(car.softLockExpiresAt);
    if (!countdownLabel) {
        return STATUS_LABELS.soft_locked;
    }

    if (countdownLabel === "Available now") {
        return countdownLabel;
    }

    return `Soft Lock ${countdownLabel}`;
};

export const getAvailabilityClassName = (status: CarAvailabilityStatus): string => {
    switch (status) {
        case "available":
            return "bg-emerald-500 text-white";
        case "soft_locked":
            return "bg-amber-500 text-white";
        case "booked":
            return "bg-zinc-900 text-white";
        case "maintenance":
        default:
            return "bg-rose-600 text-white";
    }
};

export const getAvailabilityMessage = (car: Pick<Car, "availabilityMessage" | "availabilityStatus" | "status">): string => {
    if (car.availabilityMessage && car.availabilityMessage.trim().length > 0) {
        return car.availabilityMessage;
    }

    const status = getCarAvailabilityStatus(car);
    if (status === "soft_locked") {
        return "This car is temporarily reserved while another customer completes payment.";
    }
    if (status === "booked") {
        return "This car is currently booked.";
    }
    if (status === "maintenance") {
        return "This car is currently under maintenance.";
    }
    return "This car is available for booking.";
};

export const formatTimeRemaining = (targetIso?: string | null): string | null => {
    if (!targetIso) {
        return null;
    }

    const target = new Date(targetIso).getTime();
    if (Number.isNaN(target)) {
        return null;
    }

    const delta = target - Date.now();
    if (delta <= 0) {
        return "Available now";
    }

    const totalSeconds = Math.floor(delta / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
