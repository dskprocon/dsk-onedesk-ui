let goHome = () => {};
let goBack = () => {};

export const setGoHome = (fn) => {
  goHome = fn;
};

export const setGoBack = (fn) => {
  goBack = fn;
};

export const triggerGoHome = () => {
  goHome();
};

export const triggerGoBack = () => {
  goBack();
};
