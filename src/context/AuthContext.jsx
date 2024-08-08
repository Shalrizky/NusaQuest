import { createContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  database,
  ref,
  set,
} from "../firebaseConfig";
import CustomToast from "../components/CustomToast";

// Constants
const SESSION_TIMEOUT = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

// Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTitle, setToastTitle] = useState("");
  const [toastBgColor, setToastBgColor] = useState("light");
  const [toastActionType, setToastActionType] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const sessionTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Utility function to clear session storage
  const clearSessionStorage = useCallback(() => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionExpired");
  }, []);

  // Utility function to show toast message
  const showToastMessage = useCallback((title, message, bgColor) => {
    setToastTitle(title);
    setToastMessage(message);
    setToastBgColor(bgColor);
    setToastActionType(bgColor);
    setShowToast(true);
  }, []);

  // Handle session expiration
  const handleSessionExpiration = useCallback(() => {
    setToastTitle("Session Expired");
    setToastMessage(
      "Your session is about to expire. Would you like to extend it?"
    );
    setToastBgColor("warning");
    setToastActionType("warning");
    setShowToast(true);
    setSessionExpired(true);
    localStorage.setItem("sessionExpired", "true");
  }, []);

  // Reset the session timeout
  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    if (user) {
      sessionTimeoutRef.current = setTimeout(
        handleSessionExpiration,
        SESSION_TIMEOUT
      );
    }
  }, [user, handleSessionExpiration]);

  // Logout user and clear session
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    signOut(auth);
    navigate("/");
    clearSessionStorage();
    showToastMessage(
      "Logout Successful",
      "You have been logged out.",
      "success"
    );
    setSessionExpired(false);
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
  }, [navigate, clearSessionStorage, showToastMessage]);

  // Extend session by resetting the timeout
  const extendSession = useCallback(() => {
    setShowToast(false);
    setSessionExpired(false);
    localStorage.removeItem("sessionExpired");
    resetSessionTimeout();
  }, [resetSessionTimeout]);

  // Handle session cancel action
  const handleCancelSession = useCallback(() => {
    logout();
  }, [logout]);

  // Check session state on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const sessionExpired = localStorage.getItem("sessionExpired") === "true";

    if (sessionExpired) {
      logout();
    } else if (loggedIn && storedUser) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }
    setInitialized(true);
  }, [logout]);

  // Set up activity listeners to reset session timeout
  useEffect(() => {
    const handleUserActivity = () => {
      if (!sessionExpired) {
        resetSessionTimeout();
      }
    };

    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart"];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    resetSessionTimeout();
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user, sessionExpired, resetSessionTimeout]);

  // Sign in with Google and handle success or failure
  const signInWithGoogle = async () => {
    setShowToast(false);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = result.user;

      const userDetails = {
        displayName: userData.displayName,
        email: userData.email,
        photoURL: userData.photoURL,
        uid: userData.uid,
      };

      await saveUserDataToDatabase(userDetails);
      updateUserLoginStatus(userDetails);
      navigate("/");
    } catch (error) {
      handleSignInError(error);
    }
  };

  // Save user data to the database
  const saveUserDataToDatabase = async (userData) => {
    const usersRef = ref(database, "users/" + userData.uid);
    await set(usersRef, userData);
  };

  // Update user login status
  const updateUserLoginStatus = useCallback(
    (userData) => {
      setIsLoggedIn(true);
      setUser({
        displayName: userData.displayName,
        email: userData.email,
        photoURL: userData.photoURL,
      });
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem(
        "user",
        JSON.stringify({
          displayName: userData.displayName,
          email: userData.email,
          photoURL: userData.photoURL,
        })
      );
      localStorage.removeItem("sessionExpired");
      showToastMessage(
        "Login Successful",
        `Welcome ${userData.displayName}!`,
        "success"
      );
      setSessionExpired(false);
    },
    [showToastMessage]
  );

  // Handle sign-in errors
  const handleSignInError = useCallback(
    (error) => {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("User cancelled the sign-in process");
        showToastMessage(
          "Sign-in Cancelled",
          "Sign-in cancelled. Please try again.",
          "danger"
        );
      } else {
        console.error("Error signing in:", error);
        showToastMessage(
          "Sign-in Failed",
          "Failed to sign in. Please try again later or contact our support team",
          "danger",
        );
      }
    },
    [showToastMessage]
  );

  // Add beforeunload event listener for automatic logout on browser close
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("isReloading", "true");
    };

    const handleUnload = () => {
      if (sessionStorage.getItem("isReloading") === "true") {
        sessionStorage.removeItem("isReloading");
      } else {
        logout();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, [logout]);

  // Style for session expiration overlay
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(128, 128, 128, 0.5)",
    zIndex: 4, // Ensure it's lower than the toast's z-index
    display: sessionExpired ? "block" : "none",
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        initialized,
        signInWithGoogle,
        logout,
        extendSession,
      }}
    >
      <div style={overlayStyle}></div>
      <div>{children}</div>
      <CustomToast
        showToast={showToast}
        setShowToast={setShowToast}
        title={toastTitle}
        body={toastMessage}
        bgColor={toastBgColor}
        actionType={toastActionType}
        onExtendSession={
          toastActionType === "warning" ? extendSession : undefined
        }
        onCancelSession={
          toastActionType === "warning" ? handleCancelSession : undefined
        }
      />
    </AuthContext.Provider>
  );
};

export { AuthContext };
