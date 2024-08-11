import { ref, set, get, database } from "../firebaseConfig";

export const saveNewUserData = async (userData) => {
  try {
    const usersRef = ref(database, "users/" + userData.uid);
    await set(usersRef, userData);
  } catch (error) {
    console.error("Error saving new user data:", error);
  }
};

export const checkIfUserExists = async (uid) => {
  try {
    const usersRef = ref(database, "users/" + uid);
    const snapshot = await get(usersRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
};

export const getUserDataFromDatabase = async (uid) => {
  try {
    const usersRef = ref(database, "users/" + uid);
    const snapshot = await get(usersRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error fetching user data from Firebase:", error);
    return null;
  }
};

export const updateUserData = async (userData) => {
  try {
    const userRef = ref(database, "users/" + userData.uid);
    await set(userRef, userData);
    console.log("User data updated successfully in Firebase.");
  } catch (error) {
    console.error("Error updating user data in Firebase:", error);
    throw error;
  }
};
