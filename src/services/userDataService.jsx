// !? Ini adalah services untuk mengarah ke database user
import {
  ref,
  set,
  get,
  database,
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "../firebaseConfig";

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

export const getUserData = async (uid) => {
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
    const cleanedUserData = Object.fromEntries(
      Object.entries(userData).filter(([key, value]) => value !== undefined)
    );

    const userRef = ref(database, "users/" + cleanedUserData.uid);
    await set(userRef, cleanedUserData);
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

export const uploadPhoto = async (file, userId) => {
  try {
    const fileRef = storageRef(storage, `profilePhotos/${userId}/${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Hanya kembalikan downloadURL tanpa mengubah struktur lainnya
    return { downloadURL };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const deletePreviousPhoto = async (photoPath) => {
  if (!photoPath) return;

  try {
    const photoRef = storageRef(storage, photoPath);
    await deleteObject(photoRef);
  } catch (error) {
    if (error.code === "storage/object-not-found") {
      console.log(
        "Photo does not exist in Firebase Storage, skipping deletion."
      );
    } else {
      console.error("Error deleting previous photo:", error);
      throw error;
    }
  }
};
