// navigationHelper.js

let goHomeFunction = null;
let goBackFunction = null;

export const setGoHome = (fn) => {
    goHomeFunction = fn;
};

export const setGoBack = (fn) => {
    goBackFunction = fn;
};

export const triggerGoHome = () => {
    if (goHomeFunction) goHomeFunction();
};

export const triggerGoBack = () => {
    if (goBackFunction) goBackFunction();
};
