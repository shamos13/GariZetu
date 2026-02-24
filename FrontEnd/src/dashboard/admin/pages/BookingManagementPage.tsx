import { useCallback, useEffect, useMemo, useState } from "react";
import {
    bookingService,
    type Booking,
    type BookingStatus,
} from "../../../services/BookingService.ts";
import { getAdminActionErrorMessage } from "../../../lib/adminErrorUtils.ts";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../components/ui/alert-dialog.tsx";

interface BookingManagementPageProps {
    onNotificationCountChange?: (count: number) => void;
}

type BookingFilter = "ALL" | BookingStatus;
type DialogVariant = "default" | "destructive";

interface ConfirmDialogState {
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: DialogVariant;
    onConfirm: () => Promise<void> | void;
}

const FILTER_OPTIONS: Array<{ label: string; value: BookingFilter }> = [
    { label: "All", value: "ALL" },
    { label: "Pending Payment", value: "PENDING_PAYMENT" },
    { label: "Pending Payment (Legacy)", value: "PENDING" },
    { label: "Admin Notified", value: "ADMIN_NOTIFIED" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Active", value: "ACTIVE" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Expired", value: "EXPIRED" },
    { label: "Rejected", value: "REJECTED" },
];

const STATUS_LABELS: Record<BookingStatus, string> = {
    PENDING_PAYMENT: "Pending Payment",
    PENDING: "Pending Payment",
    ADMIN_NOTIFIED: "Admin Notified",
    CONFIRMED: "Confirmed",
    ACTIVE: "Active",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
    REJECTED: "Rejected",
};

function getStatusClass(status: BookingStatus): string {
    switch (status) {
        case "PENDING_PAYMENT":
        case "PENDING":
            return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
        case "ADMIN_NOTIFIED":
            return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
        case "CONFIRMED":
            return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
        case "ACTIVE":
            return "bg-violet-500/20 text-violet-400 border border-violet-500/30";
        case "COMPLETED":
            return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        case "REJECTED":
            return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
        case "EXPIRED":
            return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
        case "CANCELLED":
        default:
            return "bg-red-500/20 text-red-400 border border-red-500/30";
    }
}

function formatDate(value: string): string {
    let date: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        date = new Date(year, month - 1, day);
    } else {
        date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function BookingManagementPage({ onNotificationCountChange }: BookingManagementPageProps) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<BookingFilter>("ALL");
    const [activeActionBookingId, setActiveActionBookingId] = useState<number | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

    const actionsLocked = activeActionBookingId !== null || isRefreshing;

    const loadBookings = useCallback(async (options?: { silent?: boolean; showSuccessToast?: boolean }) => {
        const { silent = false, showSuccessToast = false } = options ?? {};
        try {
            if (silent) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            const [bookingsData, unreadNotifications] = await Promise.all([
                selectedFilter === "ALL"
                    ? bookingService.getAllAdmin()
                    : bookingService.getAllAdmin(selectedFilter),
                bookingService.getAdminNotifications(false),
            ]);

            setBookings(bookingsData);
            onNotificationCountChange?.(unreadNotifications.length);

            if (showSuccessToast) {
                toast.success("Bookings refreshed.");
            }
        } catch (fetchError) {
            console.error("Failed to load admin bookings:", fetchError);
            const resolvedMessage = getAdminActionErrorMessage(fetchError, "Unable to load bookings at the moment.");
            setError(resolvedMessage);
            if (showSuccessToast) {
                toast.error(resolvedMessage);
            }
        } finally {
            if (silent) {
                setIsRefreshing(false);
            } else {
                setIsLoading(false);
            }
        }
    }, [onNotificationCountChange, selectedFilter]);

    useEffect(() => {
        void loadBookings();
    }, [loadBookings]);

    const sortedBookings = useMemo(
        () =>
            [...bookings].sort((a, b) => {
                const aTime = new Date(a.createdAt).getTime();
                const bTime = new Date(b.createdAt).getTime();
                return bTime - aTime;
            }),
        [bookings]
    );

    const performStatusUpdate = async (bookingId: number, status: BookingStatus) => {
        try {
            setError(null);
            setActiveActionBookingId(bookingId);
            await bookingService.update(bookingId, { bookingStatus: status });
            toast.success(`Booking #${bookingId} moved to ${STATUS_LABELS[status]}.`);
            await loadBookings({ silent: true });
        } catch (updateError) {
            console.error("Failed to update booking status:", updateError);
            const resolvedMessage = getAdminActionErrorMessage(updateError, "Could not update booking status. Please try again.");
            setError(resolvedMessage);
            toast.error(resolvedMessage);
        } finally {
            setActiveActionBookingId(null);
        }
    };

    const performCancel = async (bookingId: number) => {
        try {
            setError(null);
            setActiveActionBookingId(bookingId);
            await bookingService.cancel(bookingId, "Cancelled by admin");
            toast.success(`Booking #${bookingId} cancelled.`);
            await loadBookings({ silent: true });
        } catch (cancelError) {
            console.error("Failed to cancel booking:", cancelError);
            const resolvedMessage = getAdminActionErrorMessage(cancelError, "Could not cancel booking. Please try again.");
            setError(resolvedMessage);
            toast.error(resolvedMessage);
        } finally {
            setActiveActionBookingId(null);
        }
    };

    const markNotificationRead = async (bookingId: number) => {
        try {
            setError(null);
            setActiveActionBookingId(bookingId);
            await bookingService.markAdminNotificationRead(bookingId);
            toast.success(`Booking #${bookingId} marked as read.`);
            await loadBookings({ silent: true });
        } catch (readError) {
            console.error("Failed to mark notification as read:", readError);
            const resolvedMessage = getAdminActionErrorMessage(readError, "Could not mark notification as read.");
            setError(resolvedMessage);
            toast.error(resolvedMessage);
        } finally {
            setActiveActionBookingId(null);
        }
    };

    const openConfirmationDialog = ({
        title,
        description,
        confirmText,
        variant,
        onConfirm,
    }: Omit<ConfirmDialogState, "open">) => {
        setConfirmDialog({
            open: true,
            title,
            description,
            confirmText,
            variant,
            onConfirm,
        });
    };

    const renderActions = (booking: Booking) => {
        const isBusy = activeActionBookingId === booking.bookingId;

        return (
            <div className="flex flex-wrap gap-2">
                {(
                    booking.bookingStatus === "PENDING_PAYMENT"
                    || booking.bookingStatus === "PENDING"
                    || booking.bookingStatus === "ADMIN_NOTIFIED"
                ) && (
                    <button
                        onClick={() =>
                            openConfirmationDialog({
                                title: "Confirm booking?",
                                description: `Mark booking #${booking.bookingId} as Confirmed and notify customer workflow.`,
                                confirmText: "Confirm Booking",
                                variant: "default",
                                onConfirm: async () => {
                                    await performStatusUpdate(booking.bookingId, "CONFIRMED");
                                },
                            })
                        }
                        disabled={actionsLocked}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                    >
                        {isBusy ? "Processing..." : "Confirm"}
                    </button>
                )}

                {(booking.bookingStatus === "PENDING_PAYMENT" || booking.bookingStatus === "PENDING") && (
                    <button
                        onClick={() =>
                            openConfirmationDialog({
                                title: "Expire booking?",
                                description: `Mark booking #${booking.bookingId} as Expired. This action can impact customer checkout.`,
                                confirmText: "Expire Booking",
                                variant: "destructive",
                                onConfirm: async () => {
                                    await performStatusUpdate(booking.bookingId, "EXPIRED");
                                },
                            })
                        }
                        disabled={actionsLocked}
                        className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
                    >
                        {isBusy ? "Processing..." : "Expire"}
                    </button>
                )}

                {booking.bookingStatus === "CONFIRMED" && (
                    <button
                        onClick={() =>
                            openConfirmationDialog({
                                title: "Start trip?",
                                description: `Set booking #${booking.bookingId} to Active.`,
                                confirmText: "Start Trip",
                                variant: "default",
                                onConfirm: async () => {
                                    await performStatusUpdate(booking.bookingId, "ACTIVE");
                                },
                            })
                        }
                        disabled={actionsLocked}
                        className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-400"
                    >
                        {isBusy ? "Processing..." : "Start Trip"}
                    </button>
                )}

                {booking.bookingStatus === "ACTIVE" && (
                    <button
                        onClick={() =>
                            openConfirmationDialog({
                                title: "Complete trip?",
                                description: `Set booking #${booking.bookingId} to Completed.`,
                                confirmText: "Complete Trip",
                                variant: "default",
                                onConfirm: async () => {
                                    await performStatusUpdate(booking.bookingId, "COMPLETED");
                                },
                            })
                        }
                        disabled={actionsLocked}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                    >
                        {isBusy ? "Processing..." : "Complete"}
                    </button>
                )}

                {[
                    "PENDING_PAYMENT",
                    "PENDING",
                    "ADMIN_NOTIFIED",
                    "CONFIRMED",
                    "ACTIVE",
                ].includes(booking.bookingStatus) && (
                    <button
                        onClick={() =>
                            openConfirmationDialog({
                                title: "Cancel booking?",
                                description: `Cancel booking #${booking.bookingId}. This action is visible to the customer.`,
                                confirmText: "Cancel Booking",
                                variant: "destructive",
                                onConfirm: async () => {
                                    await performCancel(booking.bookingId);
                                },
                            })
                        }
                        disabled={actionsLocked}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                    >
                        {isBusy ? "Processing..." : "Cancel"}
                    </button>
                )}

                {Boolean(booking.adminNotifiedAt) && !booking.adminNotificationRead && (
                    <button
                        onClick={() => void markNotificationRead(booking.bookingId)}
                        disabled={actionsLocked}
                        className="rounded-md border border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isBusy ? "Processing..." : "Mark Read"}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold text-white">Booking Management</h2>
                    <p className="text-sm text-gray-400">Approve, reject, and progress customer bookings.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={selectedFilter}
                        onChange={(event) => setSelectedFilter(event.target.value as BookingFilter)}
                        className="rounded-lg border border-gray-700 bg-[#111111] px-3 py-2 text-sm text-white outline-none focus:border-gray-500"
                    >
                        {FILTER_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => void loadBookings({ silent: true, showSuccessToast: true })}
                        disabled={isLoading || isRefreshing || activeActionBookingId !== null}
                        className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</div>
            )}

            <div className="rounded-xl border border-gray-800 bg-[#151515] p-4">
                {isRefreshing && !isLoading && (
                    <div className="mb-3 text-xs text-gray-400">Refreshing bookings...</div>
                )}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="h-16 animate-pulse rounded-lg bg-gray-800/60" />
                        ))}
                    </div>
                ) : sortedBookings.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">No bookings found for this filter.</div>
                ) : (
                    <div className="space-y-3">
                        {sortedBookings.map((booking) => (
                            <div
                                key={booking.bookingId}
                                className="rounded-lg border border-gray-800 bg-[#101010] p-4"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500">Booking #{booking.bookingId}</p>
                                        <p className="text-sm font-semibold text-white">
                                            {booking.userName} • {booking.carMake} {booking.carModel}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatDate(booking.pickupDate)} to {formatDate(booking.returnDate)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Payment: {booking.paymentStatus || "UNPAID"}
                                            {booking.paymentReference ? ` (${booking.paymentReference})` : ""}
                                        </p>
                                    </div>

                                    <div className="text-left space-y-2 md:text-right">
                                        <p className="text-sm font-semibold text-emerald-400">
                                            KES {booking.totalPrice.toLocaleString()}
                                        </p>
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                booking.bookingStatus
                                            )}`}
                                        >
                                            {STATUS_LABELS[booking.bookingStatus]}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3">{renderActions(booking)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {confirmDialog && (
                <AlertDialog
                    open={confirmDialog.open}
                    onOpenChange={(open) => {
                        if (!open) {
                            setConfirmDialog(null);
                        }
                    }}
                >
                    <AlertDialogContent className="bg-[#1a1a1a] border-gray-800 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">{confirmDialog.title}</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                {confirmDialog.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setConfirmDialog(null)}
                                className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                            >
                                Back
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    const run = confirmDialog.onConfirm;
                                    setConfirmDialog(null);
                                    void run();
                                }}
                                className={
                                    confirmDialog.variant === "destructive"
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-white text-black hover:bg-gray-200"
                                }
                            >
                                {confirmDialog.confirmText}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
