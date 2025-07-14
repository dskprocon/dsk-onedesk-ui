// logoutHelper.js

let logoutFunction = null;

export const setLogoutFunction = (fn) => {
    logoutFunction = fn;
};

export const triggerLogout = () => {
    if (logoutFunction) logoutFunction();
};
