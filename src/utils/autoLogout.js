// src/utils/autoLogout.js
export function startAutoLogout(logoutFn, timeout = 5 * 60 * 1000) {
    let timer;

    const resetTimer = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            console.warn("🕒 Auto logout triggered due to inactivity.");
            logoutFn();
        }, timeout);
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

    const attachListeners = () => {
        events.forEach(event =>
            window.addEventListener(event, resetTimer, { passive: true })
        );
    };

    const detachListeners = () => {
        events.forEach(event =>
            window.removeEventListener(event, resetTimer)
        );
        clearTimeout(timer);
    };

    // Start the tracking
    attachListeners();
    resetTimer();

    // Return cleanup function
    return () => {
        detachListeners();
    };
}
