export const getPlayerAtRelativePosition = (currentUserId, relativePos) => {
  const positions = ["player1", "player2", "player3", "player4"];
  const currentIndex = positions.indexOf(currentUserId);
  const offsetMap = {
    left: 1,
    top: 2,
    right: 3,
  };
  if (currentIndex === -1) return null;

  const targetIndex = (currentIndex + offsetMap[relativePos]) % 4;
  return positions[targetIndex];
};

// Mendapatkan indeks numerik global dari ID pemain
export const getPlayerGlobalIndex = (playerId) => {
  const playerMap = {
    player1: 0,
    player2: 1,
    player3: 2,
    player4: 3,
  };
  return playerMap[playerId];
};

// Mengambil kartu pemain dari gameState
export const getPlayerCards = (playerId, gameState) => {
  const cardKey = `${playerId}Cards`;
  return gameState[cardKey] || [];
};

// Mengambil status pemain dari gameState
export const getPlayerStatus = (playerId, gameState) => {
  return gameState.playerStatus[playerId] || "not_available";
};

// Menentukan indeks pemain berikutnya dalam urutan
export const getNextPlayerIndex = (currentPlayerGlobalIndex, activePlayerIndices, turnDirection) => {
  const currentIndexInActiveList = activePlayerIndices.indexOf(currentPlayerGlobalIndex);
  if (currentIndexInActiveList === -1) {
    return activePlayerIndices.length > 0 ? activePlayerIndices[0] : -1;
  }

  let nextIndexInActiveList;
  if (turnDirection === "clockwise") {
    nextIndexInActiveList = (currentIndexInActiveList + 1) % activePlayerIndices.length;
  } else {
    nextIndexInActiveList = (currentIndexInActiveList - 1 + activePlayerIndices.length) % activePlayerIndices.length;
  }
  return activePlayerIndices[nextIndexInActiveList];
};