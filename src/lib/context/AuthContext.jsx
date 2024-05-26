import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, signInWithPopup, signOut, database, ref, set } from "../../config/firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    signOut(auth);
    navigate("/");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    console.clear();
  }, [navigate]);

  // Menjaga user tetap login dengan mengambil data dari localstorage/chace
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (loggedIn && storedUser) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    let sessionTimeout;

    const resetTimeout = () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
      if (user) {
        sessionTimeout = setTimeout(() => {
          logout();
          console.log("Sesi telah berakhir", sessionTimeout);
        },  5 * 3600 * 1000);
      }
    };

    // Fungsi yang dipanggil setiap kali ada aktivitas pengguna untuk mereset timeout sesi pengguna/sesi tidak akan habis jika user sedang melakukan aktifitas pada browser
    const handleUserActivity = () => {
      resetTimeout();
    };

    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart"];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    resetTimeout();
    return () => {
      clearTimeout(sessionTimeout);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user, logout]);

  const signInWithGoogle = async () => {
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
      console.log("User ID:", userData.uid);
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        console.error("Error signing in with Google:", error);
        throw error;
      }
    }
  };

  // Jika user belum mempunyai akun maka masukkan data ke dalam database
  const saveUserDataToDatabase = async (userData) => {
    const usersRef = ref(database, "users/" + userData.uid);
    await set(usersRef, userData);
  };

  // Inisasi untuk menyimpan informasi login ke local storage dengan setting menjadi true agar dapat mengakses konten
  const updateUserLoginStatus = (userData) => {
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
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, initialized, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
