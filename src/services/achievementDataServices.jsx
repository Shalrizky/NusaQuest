import { database, ref, get, set, runTransaction, onValue } from "../firebaseConfig";

// Konstanta untuk game names dan topics
const GAMES = {
  game1: {
    key: "game1",
    name: "Ular Tangga",
    prefix: "Master Ular Tangga"
  },
  game2: {
    key: "game2",
    name: "Nuca",
    prefix: "Master Nuca"
  }
};

const TOPICS = {
  daerah_jawa_barat: {
    key: "daerah_jawa_barat",
    name: "Daerah Jawa Barat"
  },
  kuliner_jawa_barat: {
    key: "kuliner_jawa_barat",
    name: "Kuliner Jawa Barat"
  },
  pariwisata_bahari: {
    key: "pariwisata_bahari",
    name: "Pariwisata Bahari"
  },
  pariwisata_darat: {
    key: "pariwisata_darat",
    name: "Pariwisata Darat"
  },
  permainan_daerah: {
    key: "permainan_daerah",
    name: "Permainan Tradisional"
  }
};

const BADGE_LEVELS = {
  GOLD: {
    minWins: 5,
    icon: "/assets/game/gold-badge.png",
    prefix: "Gold Badge"
  },
  SILVER: {
    minWins: 3,
    icon: "/assets/game/silver-badge.png",
    prefix: "Silver Badge"
  },
  BRONZE: {
    minWins: 1,
    icon: "/assets/game/bronze-badge.png",
    prefix: "Bronze Badge"
  },
  NONE: {
    minWins: 0,
    icon: "/assets/game/no-badge.png",
    prefix: "No Badge"
  }
};

// Fungsi untuk menambahkan listener pada achievement tertentu
export const listenToAchievementUpdates = (uid, gameKey, topicKey, callback) => {
  const achievementRef = ref(database, `achievements/${uid}/${gameKey}/${topicKey}`);

  const unsubscribe = onValue(achievementRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });

  // Mengembalikan fungsi unsubscribe untuk menghentikan listener saat tidak dibutuhkan
  return unsubscribe;
};

// Inisialisasi achievement untuk user baru
export const initializeUserAchievement = async (uid) => {
  if (!uid) {
    throw new Error("User ID is missing. Cannot initialize achievements.");
  }

  const achievements = {};

  Object.values(GAMES).forEach(game => {
    achievements[game.key] = {};

    Object.values(TOPICS).forEach(topic => {
      achievements[game.key][topic.key] = {
        totalWins: 0,
        achievement_name: `${game.prefix} ${topic.name}`,
        achievement_trophy: "/assets/game/trophy.png",
        badge: {
          badgeName: `No Badge in ${topic.name} (${game.name})`,
          iconURL: BADGE_LEVELS.NONE.icon,
        },
        lastUpdated: new Date().toISOString()
      };
    });
  });

  await saveNewAchievementsData(uid, achievements);
  return achievements;
};

// Save achievement data ke Firebase
export const saveNewAchievementsData = async (uid, achievementData) => {
  try {
    await set(ref(database, `achievements/${uid}`), achievementData);
  } catch (error) {
    console.error("Error saving achievement data:", error);
    throw new Error("Could not save achievement data");
  }
};

// Cek apakah achievement sudah ada
export const checkIfAchievementExists = async (uid) => {
  try {
    const snapshot = await get(ref(database, `achievements/${uid}`));
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking achievement existence:", error);
    throw new Error("Could not check achievement data");
  }
};

// Get achievement data
export const getUserAchievements = async (uid) => {
  try {
    const snapshot = await get(ref(database, `achievements/${uid}`));
    return snapshot.val();
  } catch (error) {
    console.error("Error fetching achievements:", error);
    throw new Error("Could not fetch achievements");
  }
};

// Update achievement saat menang
export const updateWinningAchievement = async (uid, gameKey, topicKey) => {
  console.log("updateWinningAchievement called");
  if (!uid || !gameKey || !topicKey) {
    throw new Error("Missing required parameters for achievement update");
  }

  try {
    const achievementRef = ref(database, `achievements/${uid}/${gameKey}/${topicKey}`);
    
    // Menggunakan transaction untuk memastikan update yang akurat
    await runTransaction(achievementRef, (currentData) => {
      if (currentData === null) {
        return {
          totalWins: 1,
          achievement_name: `Master ${gameKey === "game1" ? "Ular Tangga" : "Nuca"} ${topicKey.replace(/_/g, " ")}`,
          achievement_trophy: "/assets/game/trophy.png",
          badge: {
            badgeName: `Bronze Badge - 1 Win`,
            iconURL: "/assets/game/bronze-badge.png"
          },
          lastUpdated: new Date().toISOString()
        };
      }

      // Increment wins
      const newTotalWins = (currentData.totalWins || 0) + 1;
      
      // Get badge details
      let badge = {
        badgeName: `No Badge`,
        iconURL: "/assets/game/no-badge.png"
      };

      if (newTotalWins >= 5) {
        badge = {
          badgeName: `Gold Badge - ${newTotalWins} Wins`,
          iconURL: "/assets/game/gold-badge.png"
        };
      } else if (newTotalWins >= 3) {
        badge = {
          badgeName: `Silver Badge - ${newTotalWins} Wins`,
          iconURL: "/assets/game/silver-badge.png"
        };
      } else if (newTotalWins >= 1) {
        badge = {
          badgeName: `Bronze Badge - ${newTotalWins} Wins`,
          iconURL: "/assets/game/bronze-badge.png"
        };
      }

      return {
        ...currentData,
        totalWins: newTotalWins,
        badge,
        lastUpdated: new Date().toISOString()
      };
    });

    return true;
  } catch (error) {
    console.error("Error updating achievement:", error);
    throw new Error("Failed to update achievement");
  }
};

// Get specific achievement
export const getSpecificAchievement = async (uid, gameKey, topicKey) => {
  try {
    const snapshot = await get(ref(database, `achievements/${uid}/${gameKey}/${topicKey}`));
    return snapshot.val();
  } catch (error) {
    console.error("Error fetching specific achievement:", error);
    throw new Error("Could not fetch achievement");
  }
};