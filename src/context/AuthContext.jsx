import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
} from "../firebaseConfig";
import {
  saveNewUserData,
  checkIfUserExists,
  getUserDataFromDatabase,
  updateUserData,
} from "../services/userDataService";
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from "../utils/localStorageUtil";
import {
  startSessionTimeout,
  resetSessionTimeout,
  clearSessionTimeout,
} from "../utils/sessionUtil";
import CustomToast from "../components/CustomToast";

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

  const showToastMessage = useCallback((title, message, bgColor) => {
    setToastTitle(title);
    setToastMessage(message);
    setToastBgColor(bgColor);
    setToastActionType(bgColor);
    setShowToast(true);
  }, []);

  const handleSessionExpiration = useCallback(() => {
    showToastMessage("Session Expired", "Your session is about to expire. Would you like to extend it?", "warning");
    setSessionExpired(true);
    setLocalStorageItem("sessionExpired", "true");
  }, [showToastMessage]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    signOut(auth);
    navigate("/login");

    removeLocalStorageItem("isLoggedIn");
    removeLocalStorageItem("user");
    removeLocalStorageItem("sessionExpired");

    showToastMessage("Logout Successful", "You have been logged out.", "success");
    setSessionExpired(false);
    clearSessionTimeout();
  }, [navigate, showToastMessage]);

  const extendSession = useCallback(() => {
    setShowToast(false);
    setSessionExpired(false);
    removeLocalStorageItem("sessionExpired");
    resetSessionTimeout(handleSessionExpiration);
  }, [handleSessionExpiration]);

  const handleCancelSession = useCallback(() => {
    logout();
  }, [logout]);

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

  const handleSignIn = async () => {
    setShowToast(false);
    try {
      const result = await signInWithPopup(auth, googleProvider); // Ensure auth is passed
      const userData = result.user;

      const userDetails = {
        displayName: userData.displayName,
        email: userData.email,
        photoURL: userData.photoURL,
        uid: userData.uid,
      };

      const userExists = await checkIfUserExists(userDetails.uid);

      if (!userExists) {
        await saveNewUserData(userDetails);
      } else {
        const existingUserData = await getUserDataFromDatabase(userDetails.uid);
        if (existingUserData) {
          Object.assign(userDetails, existingUserData);
        }
      }

      updateUserLoginStatus(userDetails);
      navigate("/");
    } catch (error) {
      handleSignInError(error);
    }
  };

  const updateUserLoginStatus = useCallback(
    (userData) => {
      setIsLoggedIn(true);
      setUser(userData);
      setLocalStorageItem("isLoggedIn", "true");
      setLocalStorageItem("user", userData);
      removeLocalStorageItem("sessionExpired");
      showToastMessage("Login Successful", `Welcome ${userData.displayName}!`, "success");
      setSessionExpired(false);
      startSessionTimeout(handleSessionExpiration);
    },
    [showToastMessage, handleSessionExpiration]
  );

  const handleSignInError = useCallback(
    (error) => {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("User cancelled the sign-in process");
        showToastMessage("Sign-in Cancelled", "Sign-in cancelled. Please try again.", "danger");
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
        signInWithGoogle: handleSignIn,
        logout,
        extendSession,
        updateUserData,
        updateUserLoginStatus,
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
