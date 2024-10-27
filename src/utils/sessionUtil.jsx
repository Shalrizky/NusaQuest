const SESSION_TIMEOUT = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

let sessionTimeoutRef = null;

export const startSessionTimeout = (handleSessionExpiration) => {
  sessionTimeoutRef = setTimeout(handleSessionExpiration, SESSION_TIMEOUT);
};

export const resetSessionTimeout = (handleSessionExpiration) => {
  if (sessionTimeoutRef) {
    clearTimeout(sessionTimeoutRef);
  }
  sessionTimeoutRef = setTimeout(handleSessionExpiration, SESSION_TIMEOUT);
};

export const clearSessionTimeout = () => {
  if (sessionTimeoutRef) {
    clearTimeout(sessionTimeoutRef);
    sessionTimeoutRef = null;
  }
};