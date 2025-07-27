const PLAYER_POSITIONS = ["player1", "player2", "player3", "player4"];
const POSITION_OFFSET_MAP = {
  left: 1, 
  top: 2, 
  right: 3, 
};
const PLAYER_INDEX_MAP = {
  player1: 0, 
  player2: 1,
  player3: 2,
  player4: 3,
};

/**
 * @function getPlayerAtRelativePosition
 * @description Mendapatkan ID pemain pada posisi relatif tertentu (kiri, atas, kanan) dari pemain saat ini.
 * Fungsi ini mengasumsikan urutan pemain melingkar.
 * @param {string} currentUserId - ID pemain saat ini (misalnya "player1").
 * @param {string} relativePos - Posisi relatif yang diinginkan ("left", "top", atau "right").
 * @returns {string|null} ID pemain pada posisi relatif yang ditentukan, atau `null` jika input tidak valid.
 */
export const getPlayerAtRelativePosition = (currentUserId, relativePos) => {
  const currentIndex = PLAYER_POSITIONS.indexOf(currentUserId); 
  const offset = POSITION_OFFSET_MAP[relativePos]; 
  if (currentIndex === -1 || offset === undefined) {
    return null;
  }

  const targetIndex = (currentIndex + offset) % PLAYER_POSITIONS.length;
  return PLAYER_POSITIONS[targetIndex];
};

/**
 * @function getPlayerGlobalIndex
 * @description Mendapatkan indeks global (0-3) dari ID pemain.
 * @param {string} playerId - ID pemain (misalnya "player1", "player2").
 * @returns {number|undefined} Indeks global pemain (0-3) jika ID valid, atau `undefined` jika ID tidak valid.
 */
export const getPlayerGlobalIndex = (playerId) => {
  return PLAYER_INDEX_MAP[playerId]; 
};

/**
 * @function getPlayerCards
 * @description Mengambil array kartu yang dimiliki oleh pemain tertentu dari objek `gameState`.
 * @param {string} playerId - ID pemain (misalnya "player1").
 * @param {Object} gameState - Objek state permainan saat ini yang berisi data kartu pemain (misalnya `player1Cards`).
 * @returns {Array} Array objek kartu pemain, atau array kosong jika pemain atau kartunya tidak ditemukan.
 */
export const getPlayerCards = (playerId, gameState) => {
  if (!playerId || !gameState) {
    return []; 
  }
  const cardKey = `${playerId}Cards`; 
  return gameState[cardKey] || [];
};

/**
 * @function getPlayerStatus
 * @description Mengambil status seorang pemain (tersedia atau tidak tersedia) dari objek `gameState`.
 * @param {string} playerId - ID pemain (misalnya "player1").
 * @param {Object} gameState - Objek state permainan saat ini yang berisi status pemain (`gameState.playerStatus`).
 * @returns {string} Status pemain ("available" atau "not_available"). Mengembalikan "not_available" jika input tidak valid atau status tidak ditemukan.
 */
export const getPlayerStatus = (playerId, gameState) => {
  if (!playerId || !gameState?.playerStatus) {
    return "not_available"; 
  }
  return gameState.playerStatus[playerId] || "not_available";
};

/**
 * @function getNextPlayerIndex
 * @description Menentukan indeks global pemain berikutnya dalam urutan giliran, dengan mempertimbangkan hanya pemain aktif dan arah giliran.
 * @param {number} currentPlayerGlobalIndex - Indeks global pemain yang gilirannya saat ini (0-3).
 * @param {Array<number>} activePlayerIndices - Array berisi indeks global dari semua pemain yang saat ini aktif dalam game.
 * @param {string} [turnDirection="clockwise"] - Arah giliran ("clockwise" atau "counterclockwise").
 * @returns {number} Indeks global pemain berikutnya, atau `-1` jika tidak ada pemain aktif.
 */
export const getNextPlayerIndex = (
  currentPlayerGlobalIndex,
  activePlayerIndices,
  turnDirection = "clockwise"
) => {
  if (!Array.isArray(activePlayerIndices) || activePlayerIndices.length === 0) {
    return -1; 
  }

  const currentIndexInActiveList = activePlayerIndices.indexOf(
    currentPlayerGlobalIndex
  );

  if (currentIndexInActiveList === -1) {
    return activePlayerIndices[0];
  }

  let nextIndexInActiveList;
  if (turnDirection === "clockwise") {
    nextIndexInActiveList =
      (currentIndexInActiveList + 1) % activePlayerIndices.length;
  } else {
    nextIndexInActiveList =
      (currentIndexInActiveList - 1 + activePlayerIndices.length) %
      activePlayerIndices.length;
  }

  return activePlayerIndices[nextIndexInActiveList];
};

