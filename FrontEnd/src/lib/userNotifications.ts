import { authService } from "../services/AuthService.ts";

export const USER_NOTIFICATIONS_CHANGED_EVENT = "garizetu_user_notifications_changed";
const STORAGE_KEY_PREFIX = "garizetu_user_notifications_v2";
const MAX_NOTIFICATIONS = 25;

export type UserNotificationLevel = "info" | "warning" | "error" | "success";

export interface UserNotification {
    id: string;
    title: string;
    message: string;
    level: UserNotificationLevel;
    actionPath?: string;
    actionLabel?: string;
    createdAt: string;
    read: boolean;
}

interface NewNotification {
    title: string;
    message: string;
    level?: UserNotificationLevel;
    actionPath?: string;
    actionLabel?: string;
}

const emitNotificationsChanged = () => {
    window.dispatchEvent(new CustomEvent(USER_NOTIFICATIONS_CHANGED_EVENT));
};

const getStorageKey = (): string => {
    const user = authService.getUser();
    if (!user) {
        return `${STORAGE_KEY_PREFIX}:guest`;
    }

    const safeRole = typeof user.role === "string" ? user.role.toLowerCase() : "member";
    return `${STORAGE_KEY_PREFIX}:${user.userId}:${safeRole}`;
};

const readStoredNotifications = (): UserNotification[] => {
    try {
        const raw = localStorage.getItem(getStorageKey());
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as UserNotification[];
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;
    } catch {
        return [];
    }
};

const storeNotifications = (notifications: UserNotification[]): void => {
    localStorage.setItem(getStorageKey(), JSON.stringify(notifications));
    emitNotificationsChanged();
};

export const getUserNotifications = (): UserNotification[] => readStoredNotifications();

export const pushUserNotification = (notification: NewNotification): UserNotification => {
    const entry: UserNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: notification.title.trim() || "Notification",
        message: notification.message.trim(),
        level: notification.level ?? "info",
        actionPath: notification.actionPath?.trim() || undefined,
        actionLabel: notification.actionLabel?.trim() || undefined,
        createdAt: new Date().toISOString(),
        read: false,
    };

    const current = readStoredNotifications();
    const next = [entry, ...current].slice(0, MAX_NOTIFICATIONS);
    storeNotifications(next);
    return entry;
};

export const markAllNotificationsRead = (): void => {
    const current = readStoredNotifications();
    const next = current.map((entry) => ({ ...entry, read: true }));
    storeNotifications(next);
};

export const clearUserNotifications = (): void => {
    localStorage.removeItem(getStorageKey());
    emitNotificationsChanged();
};
