export const AUTH_CHANGED_EVENT = "garizetu-auth-changed";

export const emitAuthChanged = (): void => {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};
