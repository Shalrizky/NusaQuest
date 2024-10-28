import { database, ref, set, get } from "../firebaseConfig";

// Fungsi membuat data achievement untuk user
export const initializeUserAchievement = async (uid) => {
  if (!uid) {
    throw new Error("User ID is missing. Cannot initialize achievements.");
  }

  // Define the game names and topics
  const games = [
    { key: "game1", prefix: "Master Ular Tangga" },
    { key: "game2", prefix: "Master Nuca" },
  ];

  const topics = [
    { key: "daerah_jawa_barat", name: "Daerah Jawa Barat" },
    { key: "kuliner_jawa_barat", name: "Kuliner Jawa Barat" },
    { key: "pariwisata_bahari", name: "Pariwisata Bahari" },
    { key: "pariwisata_darat", name: "Pariwisata Darat" },
    { key: "permainan_daerah", name: "Permainan Tradisional" },
  ];

  // Membuat achievement data langsung dalam fungsi ini
  const achievements = {};

  games.forEach((game) => {
    achievements[game.key] = {}; 

    topics.forEach((topic) => {
      achievements[game.key][topic.key] = {
        totalWins: 0,
        achievement_name: `${game.prefix} ${topic.name}`, 
        achievement_trophy: "/assets/game/trophy.png",
        badge: {
          badgeName: getBadgeName(0, game.prefix, topic.name), 
          iconURL: getBadgeIconURL(0), 
        },
      };
    });
  });

  await saveNewAchievementsData(uid, achievements);
};

// Fungsi untuk menentukan nama badge berdasarkan total kemenangan
const getBadgeName = (totalWins, gamePrefix, topicName) => {
   const gameName = gamePrefix.replace("Master ", ""); // Menghilangkan "Master"
   
   if (totalWins >= 5) {
     return `Gold Badge - ${totalWins} Wins in ${gameName} ${topicName}`;
   } else if (totalWins >= 3) {
     return `Silver Badge - ${totalWins} Wins in ${gameName} ${topicName}`;
   } else if (totalWins >= 1) {
     return `Bronze Badge - ${totalWins} Wins in ${gameName} ${topicName}`;
   } else {
     return `No Badge in ${topicName} (${gameName})`;
   }
 };
 

// Fungsi untuk menentukan icon badge berdasarkan total kemenangan
const getBadgeIconURL = (totalWins) => {
  if (totalWins >= 5) {
    return "/assets/game/gold-badge.png";
  } else if (totalWins >= 3) {
    return "/assets/game/silver-badge.png";
  } else if (totalWins >= 1) {
    return "/assets/game/bronze-badge.png";
  } else {
    return "/assets/game/no-badge.png";
  }
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

export const getUserAchievements = async (uid) => {
  try {
    const achievementsRef = ref(database, "achievements/" + uid);
    const snapshot = await get(achievementsRef);
    return snapshot.val(); // Return the achievement data
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    throw new Error("Could not fetch user achievements");
  }
};
