import React, { useMemo, useCallback } from "react";
import { Row, Col } from "react-bootstrap";
import PlayerBackStackCards from "./PlayerBackStackCards";
import PlayerHandCards from "./PlayerHandCards";
import ThrowingCard from "./ThrowingCard";
import PlayerProfileNuca from "./PlayerProfileNuca";
import NotAvailablePlayerImage from "../../../assets/games/nuca/notAvailPlayerNuca.png";
import {
  getPlayerAtRelativePosition,
  getPlayerGlobalIndex,
  getPlayerCards,
  getPlayerStatus,
} from "../../../utils/games/nuca/NucaUtils";

// Konstanta untuk mencegah pembuatan ulang (recreation) objek/array di setiap render
const PLAYER_POSITIONS = ["top", "left", "right", "bottom"]; 
const MIDDLE_DECK_CARDS = 5; 

/**
 * @function GameArea
 * @description Komponen utama yang mengatur layout dan menampilkan area permainan NusaCard.
 * Ini bertanggung jawab untuk merender semua pemain (pemain lokal dan pemain lain),
 * tumpukan kartu mereka, kartu yang dilempar, dan profil pemain dengan status terkait giliran.
 * @param {Object} props - Properti yang diteruskan ke komponen.
 * @param {string} props.currentUserId - ID pemain lokal/pengguna saat ini (misalnya "player1").
 * @param {Object} props.gameState - Objek state permainan global dari Firebase.
 * @param {Object} props.playerAnswerFeedback - Objek yang berisi umpan balik jawaban untuk setiap pemain.
 * @param {number} props.TIMER_PLAYER_DURATION - Durasi timer untuk fase melempar kartu.
 * @param {Object|null} props.throwCard - Objek data kartu yang terakhir dilempar ke tengah.
 * @param {function(Object): void} props.handleCardClicked - Fungsi callback yang dipicu ketika kartu pemain lokal diklik.
 * @param {function(): boolean} props.isCurrentUserTurn - Fungsi yang mengembalikan boolean apakah giliran pemain lokal saat ini.
 * @param {string} props.currentTurnPhase - Fase giliran saat ini ("throwing" atau "answering").
 * @param {number} props.TIMER_ANSWER_DURATION - Durasi timer untuk fase menjawab pertanyaan.
 * @param {function(number): boolean} props.isPlayerTurn - Fungsi yang memeriksa apakah giliran pemain tertentu berdasarkan indeks global.
 * @param {function(number): number} props.getPlayerTimeLeft - Fungsi yang mengembalikan sisa waktu untuk giliran pemain tertentu berdasarkan indeks global.
 * @param {boolean} props.triggerShuffleAnimation - Boolean untuk memicu animasi pengocokan kartu.
 * @param {Array<Object>} props.players - Array data lengkap semua pemain, termasuk informasi profil (misalnya foto).
 * @returns {JSX.Element} Elemen JSX yang mewakili area permainan.
 */
const GameArea = ({
  currentUserId,
  gameState,
  playerAnswerFeedback,
  TIMER_PLAYER_DURATION,
  throwCard,
  handleCardClicked,
  isCurrentUserTurn,
  currentTurnPhase,
  TIMER_ANSWER_DURATION,
  isPlayerTurn,
  getPlayerTimeLeft,
  triggerShuffleAnimation,
  players, 
}) => {
  /**
   * @constant playersData
   * @description Menggunakan `useMemo` untuk menghitung data yang relevan untuk setiap pemain (atas, kiri, kanan, bawah)
   * secara efisien. Ini mencakup kartu, status, indeks global, status giliran aktif, sisa waktu,
   * dan data profil pemain yang sebenarnya (termasuk foto).
   * Data ini akan di-recalculate hanya jika dependensi berubah.
   * @returns {Object} Objek yang berisi data pemain yang terstruktur berdasarkan posisinya (top, left, right, bottom).
   */
  const playersData = useMemo(() => {
    const data = {};
    PLAYER_POSITIONS.forEach((position) => {
      const playerId =
        position === "bottom"
          ? currentUserId
          : getPlayerAtRelativePosition(currentUserId, position);
      
      const playerCards = getPlayerCards(playerId, gameState);
      const playerStatus = getPlayerStatus(playerId, gameState);
      const playerGlobalIndex = getPlayerGlobalIndex(playerId); 
      const isCurrentPlayerActive = typeof isPlayerTurn === 'function'
        ? isPlayerTurn(playerGlobalIndex)
        : false; 
      const currentPlayerTimeLeft = typeof getPlayerTimeLeft === 'function'
        ? getPlayerTimeLeft(playerGlobalIndex)
        : 0; 
      const currentMaxTimeForTurn =
        currentTurnPhase === "throwing"
          ? TIMER_PLAYER_DURATION
          : TIMER_ANSWER_DURATION;
      const actualPlayerData = players && players.length > playerGlobalIndex
        ? players[playerGlobalIndex]
        : null; 

      data[position] = {
        playerId,
        playerCards,
        playerStatus,
        playerGlobalIndex,
        isCurrentPlayerActive,
        currentPlayerTimeLeft,
        currentMaxTimeForTurn,
        playerData: actualPlayerData,
        cardCount: playerCards.length, 
        answerFeedback: playerAnswerFeedback[playerId], 
        lastUpdated: Date.now(), // Timestamp terakhir data ini dihitung (untuk debugging)
      };
    });

    return data;
  }, [
    currentUserId,
    gameState,
    currentTurnPhase,
    TIMER_PLAYER_DURATION,
    TIMER_ANSWER_DURATION,
    isPlayerTurn,
    getPlayerTimeLeft,
    playerAnswerFeedback,
    players 
  ]);

  /**
   * @function renderBottomPlayer
   * @description Menggunakan `useCallback` untuk merender area pemain di bagian bawah (pemain lokal).
   * Ini mencakup kartu di tangan pemain dan profil pemainnya.
   * @returns {JSX.Element} Elemen JSX untuk pemain bawah.
   */
  const renderBottomPlayer = useCallback(() => {
    const playerData = playersData.bottom; 

    return (
      <>
        {/* Menampilkan kartu di tangan pemain lokal */}
        <PlayerHandCards
          cards={playerData.playerCards}
          onCardClick={handleCardClicked}
          isThrowingEnabled={isCurrentUserTurn()} 
        />
        {/* Menampilkan profil pemain lokal */}
        <PlayerProfileNuca
          userProfile={playerData.profileData}
          position="bottom-right" 
          totalCards={playerData.playerCards.length} 
          isActive={playerData.isCurrentPlayerActive} 
          timeLeft={playerData.currentPlayerTimeLeft}
          maxTime={playerData.currentMaxTimeForTurn} 
          currentTurnPhase={currentTurnPhase} 
          isCurrentPlayer={true} 
          playerData={playerData.playerData} 
        />
      </>
    );
  }, [
    playersData.bottom,
    handleCardClicked,
    isCurrentUserTurn,
    currentTurnPhase
  ]);

  /**
   * @function renderOtherPlayer
   * @description Menggunakan `useCallback` untuk merender area pemain lain (atas, kiri, kanan).
   * Ini menampilkan tumpukan kartu belakang (back stack) dan profil pemain mereka.
   * @param {string} position - Posisi relatif pemain ("top", "left", atau "right").
   * @returns {JSX.Element} Elemen JSX untuk pemain lain.
   */
  const renderOtherPlayer = useCallback(
    (position) => {
      const playerData = playersData[position];
      const profilePosition = position === "top" ? "top-left" : position;

      return (
        <>
          {/* Hanya render profil jika pemain "available" */}
          {playerData.playerStatus === "available" && (
            <PlayerProfileNuca
              userProfile={playerData.profileData}
              position={profilePosition}
              totalCards={playerData.playerCards.length}
              isActive={playerData.isCurrentPlayerActive}
              timeLeft={playerData.currentPlayerTimeLeft}
              maxTime={playerData.currentMaxTimeForTurn}
              answerFeedback={playerData.answerFeedback}
              currentTurnPhase={currentTurnPhase}
              isCurrentPlayer={false} 
              playerData={playerData.playerData} 
            />
          )}
          {/* Menampilkan tumpukan kartu belakang pemain */}
          <PlayerBackStackCards
            totalCards={playerData.playerCards.length}
            position={position}
            showNotAvail={playerData.playerStatus === "not_available"} 
            notAvailImage={NotAvailablePlayerImage}
          />
        </>
      );
    },
    [playersData, currentTurnPhase]
  );

  /**
   * @constant renderCenterArea
   * @description Menggunakan `useMemo` untuk merender area tengah permainan.
   * Area ini berisi tumpukan kartu utama (dek tengah) dan kartu yang terakhir dilempar.
   * @returns {JSX.Element} Elemen JSX untuk area tengah.
   */
  const renderCenterArea = useMemo(
    () => (
      <Col
        md={4}
        className="d-flex justify-content-center align-items-center position-relative"
      >
        {/* Menampilkan tumpukan kartu utama di tengah */}
        <PlayerBackStackCards
          totalCards={MIDDLE_DECK_CARDS} 
          position="middle"
          showShuffle={true} 
          triggerShuffleAnimation={triggerShuffleAnimation} 
        />
        {/* Menampilkan kartu yang terakhir dilempar */}
        {throwCard && <ThrowingCard cardData={throwCard} />}
      </Col>
    ),
    [throwCard, triggerShuffleAnimation] 
  );

  return (
    <>
      {/* Baris untuk Pemain Atas */}
      <Row className="justify-content-center align-items-center">
        <Col xs="auto" className="position-relative">
          {renderOtherPlayer("top")}
        </Col>
      </Row>

      {/* Baris Tengah: Pemain Kiri + Dek Tengah + Pemain Kanan */}
      <Row className="d-flex justify-content-between align-items-center mx-3 mx-lg-4">
        <Col md={4}>
          <div className="position-relative">{renderOtherPlayer("left")}</div>
        </Col>

        {renderCenterArea}

        <Col md={4}>
          <div className="position-relative">{renderOtherPlayer("right")}</div>
        </Col>
      </Row>

      {/* Baris untuk Pemain Bawah (Pengguna Saat Ini) */}
      <Row className="d-flex justify-content-center align-items-center mb-4">
        <Col xs="auto" className="position-relative">
          {renderBottomPlayer()}
        </Col>
      </Row>
    </>
  );
};

/**
 * @exports GameArea
 * @description Komponen `GameArea` diekspor sebagai memoized component
 * untuk mengoptimalkan kinerja dengan mencegah re-render yang tidak perlu
 * jika propertinya tidak berubah secara dangkal (shallowly).
 */
export default React.memo(GameArea);