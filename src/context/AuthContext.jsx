import { createContext, useState, useEffect, useCallback } from "react";
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
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from "../utils/localStorageUtil"; // Adjust the path to your utility file
import {
  startSessionTimeout,
  resetSessionTimeout,
  clearSessionTimeout,
} from "../utils/sessionUtil"; // Adjust the path to your utility file

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
  const navigate = useNavigate();

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
    setLocalStorageItem("sessionExpired", "true");
  }, []);

  // Logout user and clear session
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    signOut(auth);
    navigate("/login");

    // Hapus hanya item terkait sesi pengguna
    removeLocalStorageItem("isLoggedIn");
    removeLocalStorageItem("user");
    removeLocalStorageItem("sessionExpired");

    showToastMessage(
      "Logout Successful",
      "You have been logged out.",
      "success"
    );
    setSessionExpired(false);
    clearSessionTimeout();
  }, [navigate, showToastMessage]);

  // Extend session by resetting the timeout
  const extendSession = useCallback(() => {
    setShowToast(false);
    setSessionExpired(false);
    removeLocalStorageItem("sessionExpired");
    resetSessionTimeout(handleSessionExpiration);
  }, [handleSessionExpiration]);

  // Handle session cancel action
  const handleCancelSession = useCallback(() => {
    logout();
  }, [logout]);

  // Check session state on mount
  useEffect(() => {
    const loggedIn = getLocalStorageItem("isLoggedIn") === "true";
    const storedUser = getLocalStorageItem("user");
    const sessionExpired = getLocalStorageItem("sessionExpired") === "true";

    if (sessionExpired) {
      logout();
    } else if (loggedIn && storedUser) {
      setUser(storedUser);
      setIsLoggedIn(true);
      startSessionTimeout(handleSessionExpiration); 
    }
    setInitialized(true);
  }, [logout, handleSessionExpiration]);

  // Set up activity listeners to reset session timeout
  useEffect(() => {
    if (isLoggedIn) {
      const handleUserActivity = () => {
        if (!sessionExpired) {
          resetSessionTimeout(handleSessionExpiration);
        }
      };

      const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart"];

      activityEvents.forEach((event) => {
        window.addEventListener(event, handleUserActivity);
      });

      startSessionTimeout(handleSessionExpiration);
      return () => {
        clearSessionTimeout();
        activityEvents.forEach((event) => {
          window.removeEventListener(event, handleUserActivity);
        });
      };
    }
  }, [isLoggedIn, sessionExpired, handleSessionExpiration]);

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
      setLocalStorageItem("isLoggedIn", "true");
      setLocalStorageItem("user", {
        displayName: userData.displayName,
        email: userData.email,
        photoURL: userData.photoURL,
      });
      removeLocalStorageItem("sessionExpired");
      showToastMessage(
        "Login Successful",
        `Welcome ${userData.displayName}!`,
        "success"
      );
      setSessionExpired(false);
      startSessionTimeout(handleSessionExpiration); // Start session timeout after login
    },
    [showToastMessage, handleSessionExpiration]
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
          "danger"
        );
      }
    },
    [showToastMessage]
  );

  // Style for session expiration overlay
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(128, 128, 128, 0.5)",
    zIndex: 4,
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
