// Constants
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
 * Gets the player ID at a relative position from the current user
 * @param {string} currentUserId - Current user's player ID (e.g., "player1")
 * @param {string} relativePos - Relative position ("left", "top", "right")
 * @returns {string|null} Player ID at the relative position or null if invalid
 */
export const getPlayerAtRelativePosition = (currentUserId, relativePos) => {
  const currentIndex = PLAYER_POSITIONS.indexOf(currentUserId);
  const offset = POSITION_OFFSET_MAP[relativePos];

  // Validate inputs
  if (currentIndex === -1 || offset === undefined) {
    return null;
  }

  const targetIndex = (currentIndex + offset) % PLAYER_POSITIONS.length;
  return PLAYER_POSITIONS[targetIndex];
};

/**
 * Gets the global index (0-3) from player ID
 * @param {string} playerId - Player ID (e.g., "player1")
 * @returns {number} Global index (0-3) or undefined if invalid
 */
export const getPlayerGlobalIndex = (playerId) => {
  return PLAYER_INDEX_MAP[playerId];
};

/**
 * Gets player's cards from game state
 * @param {string} playerId - Player ID (e.g., "player1")
 * @param {Object} gameState - Current game state object
 * @returns {Array} Array of player's cards or empty array if not found
 */
export const getPlayerCards = (playerId, gameState) => {
  if (!playerId || !gameState) {
    return [];
  }

  const cardKey = `${playerId}Cards`;
  return gameState[cardKey] || [];
};

/**
 * Gets player's status from game state
 * @param {string} playerId - Player ID (e.g., "player1")
 * @param {Object} gameState - Current game state object
 * @returns {string} Player status ("available" or "not_available")
 */
export const getPlayerStatus = (playerId, gameState) => {
  if (!playerId || !gameState?.playerStatus) {
    return "not_available";
  }

  return gameState.playerStatus[playerId] || "not_available";
};

/**
 * Determines the next player index in turn order
 * @param {number} currentPlayerGlobalIndex - Current player's global index (0-3)
 * @param {Array<number>} activePlayerIndices - Array of active player indices
 * @param {string} turnDirection - Turn direction ("clockwise" or "counterclockwise")
 * @returns {number} Next player's global index or -1 if no active players
 */
export const getNextPlayerIndex = (currentPlayerGlobalIndex, activePlayerIndices, turnDirection = "clockwise") => {
  // Validate inputs
  if (!Array.isArray(activePlayerIndices) || activePlayerIndices.length === 0) {
    return -1;
  }

  const currentIndexInActiveList = activePlayerIndices.indexOf(currentPlayerGlobalIndex);
  
  // If current player not in active list, return first active player
  if (currentIndexInActiveList === -1) {
    return activePlayerIndices[0];
  }

  // Calculate next index based on turn direction
  let nextIndexInActiveList;
  if (turnDirection === "clockwise") {
    nextIndexInActiveList = (currentIndexInActiveList + 1) % activePlayerIndices.length;
  } else {
    nextIndexInActiveList = (currentIndexInActiveList - 1 + activePlayerIndices.length) % activePlayerIndices.length;
  }

  return activePlayerIndices[nextIndexInActiveList];
};

/**
 * Validates if a player ID is valid
 * @param {string} playerId - Player ID to validate
 * @returns {boolean} True if valid player ID
 */
export const isValidPlayerId = (playerId) => {
  return PLAYER_POSITIONS.includes(playerId);
};

/**
 * Gets all available player IDs from game state
 * @param {Object} gameState - Current game state object
 * @returns {Array<string>} Array of available player IDs
 */
export const getAvailablePlayerIds = (gameState) => {
  if (!gameState?.playerStatus) {
    return [];
  }

  return PLAYER_POSITIONS.filter(playerId => 
    gameState.playerStatus[playerId] === "available"
  );
};

/**
 * Gets total number of cards for a player
 * @param {string} playerId - Player ID
 * @param {Object} gameState - Current game state object
 * @returns {number} Number of cards the player has
 */
export const getPlayerCardCount = (playerId, gameState) => {
  const cards = getPlayerCards(playerId, gameState);
  return cards.length;
};

/**
 * Checks if a player is currently active (their turn)
 * @param {string} playerId - Player ID to check
 * @param {number} activePlayerGlobalIndex - Currently active player's global index
 * @returns {boolean} True if the player is currently active
 */
export const isPlayerActive = (playerId, activePlayerGlobalIndex) => {
  const playerGlobalIndex = getPlayerGlobalIndex(playerId);
  return playerGlobalIndex === activePlayerGlobalIndex;
};