import { database, ref, set, get, child } from "../firebaseConfig";

// Fungsi membuat data achievement untuk user 
export const initializeUserAchievement = async (uid) => {
  if (!uid) {
    throw new Error("User ID is missing. Cannot initialize achievements.");
  }

  const games = ["game1", "game2"];
  const topics = [
    { key: "daerah_jawa_barat", name: "Master Daerah Jawa Barat" },
    { key: "kuliner_jawa_barat", name: "Master Kuliner Jawa Barat" },
    { key: "pariwisata_bahari", name: "Master Pariwisata Bahari" },
    { key: "pariwisata_darat", name: "Master Pariwisata Darat" },
    { key: "permainan_daerah", name: "Master Permainan Tradisional" },
  ];

  // Membuat achievement data langsung dalam fungsi ini
  const achievements = {};
  games.forEach((game) => {
    achievements[game] = {};
    topics.forEach((topic) => {
      achievements[game][topic.key] = {
        totalWins: 0,
        achievement_name: topic.name,
        badge: {
          badgeName: "No Badge",
          iconURL: "/assets/badges/no-badge.png",
          level: "None",
        },
        achievementAwarded: false,
      };
    });
  });

  await saveNewAchievementsData(uid, achievements);
};


// Fungsi untuk menyimpan atau menginisialisasi data achievement ke Firebase
export const saveNewAchievementsData = async (uid, achievementData) => {
   try {
     await set(ref(database, `achievements/${uid}`), achievementData);
   } catch (error) {
     console.error("Error initializing achievement data:", error);
     throw new Error("Could not initialize achievement data");
   }
 };
 
 // Fungsi untuk mengecek apakah user sudah memiliki data achievement
 export const checkIfAchievementExists = async (uid) => {
   try {
     const achievementsRef = ref(database, "achievements/" + uid);
     const snapshot = await get(achievementsRef);
     return snapshot.exists();
   } catch (error) {
     console.error("Error checking achievement data:", error);
     throw new Error("Could not check achievement data");
   }
 };
 
