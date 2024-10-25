import { database, ref, set, get } from "../firebaseConfig";

// Fungsi untuk membuat data potion untuk user baru
export const initializeUserPotion = async (uid) => {
  if (!uid) {
    throw new Error("User ID is missing. Cannot initialize potions.");
  }

  const potionData = {
    item_name: "Potion of Evasion (POE)",
    item_count: 3,
    item_img: "/assets/game/potion.png" 
  };

  await saveNewPotionData(uid, potionData);
};

// Fungsi untuk menyimpan atau menginisialisasi data potion ke Firebase
export const saveNewPotionData = async (uid, potionData) => {
  try {
    await set(ref(database, `items/${uid}/potion`), potionData);
  } catch (error) {
    console.error("Error initializing potion data:", error);
    throw new Error("Could not initialize potion data");
  }
};

// Fungsi untuk mengecek apakah user sudah memiliki potion
export const checkIfPotionExists = async (uid) => {
  try {
    const potionRef = ref(database, `items/${uid}/potion`);
    const snapshot = await get(potionRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking potion data:", error);
    throw new Error("Could not check potion data");
  }
};

export const getPotionData = async (uid) => {
  try {
    const potionRef = ref(database, `items/${uid}/potion`);
    const snapshot = await get(potionRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null; 
    }
  } catch (error) {
    console.error("Error fetching potion data:", error);
    throw new Error("Could not fetch potion data");
  }
};
