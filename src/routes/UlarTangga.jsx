import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import HeaderGame from "../components/games/HeaderGame";
import Potion from "../components/games/Potion";
import VictoryOverlay from "../components/games/VictoryOverlay";
import LoseOverlay from "../components/games/LoseOverlay";
import Board from "../components/games/uTangga/React-KonvaUlar";
import Dice from "../components/games/uTangga/Dice";
import PlayerTurnBox from "../components/games/uTangga/PlayerTurnBox";
import PlayerList from "../components/games/uTangga/PlayerList";
import {
  fetchGamePlayers,
  initializeGameState,
  updateGameState,
  listenToGameState,
  setGameStatus,
  setGameStartStatus,
  initializeGameTimer,
  cleanupGame,
  stopGameTimer,
  listenToGameTimer,
} from "../services/gameDataServices";
import {
  getPotionData,
  saveNewPotionData,
} from "../services/itemsDataServices";
import { usePlayerTimer, useGameTimer } from "../utils/timerUtils";
import "../style/routes/UlarTangga.css";

const questions = [
  // Pertanyaan contoh
  {
    id: 1,
    question:
      "Makanan yang menggunakan bumbu kacang dan sayuran segar makanan apa?",
    options: ["Docang", "Soto Betawi", "Karedok", "Gado-Gado"],
    correctAnswer: "Karedok",
  },
  {
    id: 2,
    question: "Siapa pahlawan nasional dari Jawa Timur?",
    options: ["Diponegoro", "Sudirman", "Bung Tomo", "Soekarno"],
    correctAnswer: "Bung Tomo",
  },
];

// Tangga dan ular
const tanggaUp = {
  5: 24,
  16: 66,
  61: 80,
  64: 75,
  72: 88,
  85: 94,
  19: 59,
  27: 48,
  49: 69,
};
const snakesDown = {
  22: 1,
  29: 8,
  57: 38,
  65: 43,
  67: 13,
  90: 48,
  93: 66,
  98: 76,
};

function UlarTangga() {
  const { gameID, topicID, roomID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Gunakan useRef untuk menyimpan nilai gameID, roomID, dan topicID
  const gameIDRef = useRef(gameID);
  const topicIDRef = useRef(topicID);
  const roomIDRef = useRef(roomID);

  // Ref untuk menandai apakah cleanup sudah dilakukan karena kemenangan
  const hasCleanedUpRef = useRef(false);

  // State permainan
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [pionPositionIndex, setPionPositionIndex] = useState([]);
  const [isPionMoving, setIsPionMoving] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [potionUsable, setPotionUsable] = useState(false);
  const [isPotionUsed, setIsPotionUsed] = useState(false);
  const [allowExtraRoll, setAllowExtraRoll] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [diceState, setDiceState] = useState({
    isRolling: false,
    currentNumber: 1,
    lastRoll: null,
  });
  const [playerTimers, setPlayerTimers] = useState([]);
  const prevPlayerIndexRef = useRef(currentPlayerIndex);
  const [isWinner, setIsWinner] = useState(false);

  useEffect(() => {
    if (gameOver) navigate("/");
  }, [gameOver, navigate]);

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      try {
        await setGameStatus(topicID, gameID, roomID, "playing");
        if (players.length > 0) {
          await initializeGameState(topicID, gameID, roomID, players);
          await initializeGameTimer(topicID, gameID, roomID, 1800);
        }
        setIsGameReady(true);
      } catch (error) {
        console.error("Error initializing game:", error);
      }
    };
    initGame();
  }, [topicID, gameID, roomID, players]);

  // Fetch dan update players
  useEffect(() => {
    if (!isGameReady) return;

    const unsubscribe = fetchGamePlayers(
      topicID,
      gameID,
      roomID,
      (playersData) => {
        setPlayers(playersData);
        setPionPositionIndex(new Array(playersData.length).fill(0));
        setPlayerTimers(new Array(playersData.length).fill(30));
        if (playersData.length === 0 && !hasCleanedUpRef.current) {
          cleanupGame(topicID, gameID, roomID, user);
          navigate("/");
        }
      }
    );

    return () => unsubscribe();
  }, [isGameReady, topicID, gameID, roomID, user, navigate, victory]);

  // Cleanup effect
  useEffect(() => {
    if (victory || gameOver) {
      stopGameTimer(topicID, gameID, roomID);
      setGameStartStatus(topicID, gameID, roomID, false);
      cleanupGame(topicID, gameID, roomID, user);
      hasCleanedUpRef.current = true; // Tandai bahwa cleanup sudah dilakukan
    }
  }, [victory, gameOver, topicID, gameID, roomID, user]);

  const handleTimeOut = useCallback(async () => {
    if (isPionMoving) return;
    await updateGameState(
      topicIDRef.current,
      gameIDRef.current,
      roomIDRef.current,
      {
        currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
        waitingForAnswer: false,
        showQuestion: false,
        isCorrect: null,
        potionUsable: false,
        diceState: { isRolling: false, currentNumber: 1, lastRoll: null },
      }
    );
  }, [currentPlayerIndex, players.length, isPionMoving]);

  const [timeLeft, resetPlayerTimer] = usePlayerTimer(30, handleTimeOut, {
    topicID: topicIDRef.current,
    gameID: gameIDRef.current,
    roomID: roomIDRef.current,
    isMyTurn,
    currentPlayerIndex,
    playerTimers,
    waitingForAnswer,
    players,
  });

  // Handle game over
  const handleGameOver = useCallback(async () => {
    try {
      setGameOver(true);
      await cleanupGame(topicID, gameID, roomID, user);
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Error handling game over:", error);
      navigate("/");
    }
  }, [topicID, gameID, roomID, user, navigate]);

  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;

    const unsubscribe = listenToGameTimer(
      topicID,
      gameID,
      roomID,
      (remainingTime) => {
        if (remainingTime <= 0) {
          stopGameTimer(topicID, gameID, roomID);
          handleGameOver();
        }
      }
    );

    return () => unsubscribe();
  }, [topicID, gameID, roomID, handleGameOver]);

  const gameTimeLeft = useGameTimer(1800, handleGameOver, {
    topicID: topicIDRef.current,
    gameID: gameIDRef.current,
    roomID: roomIDRef.current,
    user,
  });

  // Listen to game state changes
  useEffect(() => {
    if (!isGameReady) return;

    const unsubscribe = listenToGameState(
      topicID,
      gameID,
      roomID,
      (gameState) => {
        setCurrentPlayerIndex(gameState.currentPlayerIndex);
        setPionPositionIndex(gameState.pionPositions);
        setIsPionMoving(gameState.isMoving);
        setShowQuestion(gameState.showQuestion);
        setWaitingForAnswer(gameState.waitingForAnswer);
        setIsCorrect(gameState.isCorrect);
        setPotionUsable(gameState.potionUsable);
        setAllowExtraRoll(gameState.allowExtraRoll);
        setDiceState(
          gameState.diceState || {
            isRolling: false,
            currentNumber: 1,
            lastRoll: null,
          }
        );

        if (gameState.playerTimers) setPlayerTimers(gameState.playerTimers);

        const isCurrentPlayerTurn =
          players[gameState.currentPlayerIndex]?.uid === user?.uid;
        setIsMyTurn(isCurrentPlayerTurn);

        if (gameState.pionPositions?.some((pos) => pos === 99)) {
          const winnerIndex = gameState.pionPositions.findIndex(
            (pos) => pos === 99
          );
          setVictory(true);
          setIsWinner(players[winnerIndex]?.uid === user?.uid);
          setWinner(players[winnerIndex]?.displayName || "Player");
        }
      }
    );

    return () => unsubscribe();
  }, [isGameReady, players, topicID, gameID, roomID, user?.uid]);

  // Reset timer when currentPlayerIndex changes
  useEffect(() => {
    if (prevPlayerIndexRef.current !== currentPlayerIndex) {
      resetPlayerTimer();
    }
    prevPlayerIndexRef.current = currentPlayerIndex;
  }, [currentPlayerIndex, resetPlayerTimer]);

  const handleVictoryClose = useCallback(() => {
    cleanupGame(topicID, gameID, roomID, user);
    navigate("/"); // Navigasi ke halaman utama setelah overlay ditutup
  }, [topicID, gameID, roomID, user, navigate]);

  // Handle dice roll
  const handleDiceRollComplete = async (diceNumber, isInitialRoll) => {
    if (!isMyTurn || isPionMoving || waitingForAnswer) return;

    if (isInitialRoll) {
      // Update dice state to indicate rolling
      await updateGameState(topicID, gameID, roomID, {
        diceState: {
          isRolling: true,
          currentNumber: diceNumber,
          lastRoll: diceNumber,
        },
      });

      setTimeout(async () => {
        // Pastikan array valid
        const newPositions = Array.isArray(pionPositionIndex)
          ? [...pionPositionIndex]
          : new Array(players.length).fill(0);

        // Langsung set posisi pemain ke 99
        newPositions[currentPlayerIndex] = 99;

        // Update game state dengan posisi baru dan status sedang bergerak
        await updateGameState(topicID, gameID, roomID, {
          diceState: {
            isRolling: false,
            currentNumber: diceNumber,
            lastRoll: diceNumber,
          },
          pionPositions: newPositions,
          isMoving: true,
        });

        // Proses kemenangan
        setTimeout(async () => {
          // Jika posisi baru adalah 99, pemain menang
          if (newPositions[currentPlayerIndex] === 99) {
            if (players[currentPlayerIndex]?.uid === user?.uid) {
              await awardVictoryPotions(user);
            }
            await updateGameState(topicID, gameID, roomID, {
              gameStatus: "finished",
              isMoving: false,
            });
          }
        }, 1000); // Penundaan singkat untuk simulasi animasi
      }, 1000); // Penundaan awal untuk simulasi animasi dadu
    }
  };

  // Handle answer changes
  const handleAnswerChange = async (isAnswerCorrect) => {
    if (!isMyTurn) return;

    await updateGameState(topicID, gameID, roomID, {
      isCorrect: isAnswerCorrect,
    });

    if (isAnswerCorrect) {
      if (allowExtraRoll) {
        await updateGameState(topicID, gameID, roomID, {
          showQuestion: false,
          waitingForAnswer: false,
          potionUsable: false,
          allowExtraRoll: false,
        });
        // Reset timer tanpa mengubah giliran
        resetPlayerTimer();
      } else {
        const newPositions = [...pionPositionIndex];
        const currentPos = newPositions[currentPlayerIndex];

        if (tanggaUp[currentPos]) {
          newPositions[currentPlayerIndex] = tanggaUp[currentPos];
        }

        await updateGameState(topicID, gameID, roomID, {
          pionPositions: newPositions,
          currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
          showQuestion: false,
          waitingForAnswer: false,
          allowExtraRoll: false,
          playerTimers: new Array(players.length).fill(10), // Reset timer pemain berikutnya
        });
      }
    } else {
      await updateGameState(topicID, gameID, roomID, {
        currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
        showQuestion: false,
        waitingForAnswer: false,
        allowExtraRoll: false,
        playerTimers: new Array(players.length).fill(10), // Reset timer pemain berikutnya
      });
    }

    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  // Handle potion use
  const handlePotionUse = async () => {
    if (!isMyTurn || !potionUsable) return;

    const currentPos = pionPositionIndex[currentPlayerIndex];

    try {
      await updateGameState(topicID, gameID, roomID, {
        isMoving: true,
      });

      const newPositions = [...pionPositionIndex];

      if (tanggaUp[currentPos]) {
        newPositions[currentPlayerIndex] = tanggaUp[currentPos];
      }

      setIsPotionUsed(true);

      await updateGameState(topicID, gameID, roomID, {
        pionPositions: newPositions,
        waitingForAnswer: false,
        showQuestion: false,
        isCorrect: true,
        potionUsable: false,
        allowExtraRoll: diceState.lastRoll === 6,
      });

      // Reset timer hanya jika dadu terakhir adalah 6
      if (diceState.lastRoll === 6) {
        resetPlayerTimer();
      }

      setTimeout(async () => {
        if (diceState.lastRoll === 6) {
          await updateGameState(topicID, gameID, roomID, {
            isMoving: false,
          });
        } else {
          await updateGameState(topicID, gameID, roomID, {
            isMoving: false,
            currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
          });
        }
        setIsPotionUsed(false);
      }, 1000);
    } catch (error) {
      console.error("Error using potion:", error);
      setIsPotionUsed(false);
      await updateGameState(topicID, gameID, roomID, {
        isMoving: false,
        potionUsable: true,
      });
    }
  };

  // Award victory potions
  const awardVictoryPotions = async (winningPlayer) => {
    try {
      const currentPotionData = await getPotionData(winningPlayer.uid);
      if (currentPotionData) {
        await saveNewPotionData(winningPlayer.uid, {
          item_name: currentPotionData.item_name,
          item_count: currentPotionData.item_count + 1,
          item_img: currentPotionData.item_img,
        });
      }
    } catch (error) {
      console.error("Error awarding victory potions:", error);
    }
  };

  // Render logic
  if (!isGameReady) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid className="utangga-container d-flex flex-column">
      <HeaderGame layout="home" />

      <div className="global-timer-container d-flex justify-content-center align-items-center mb-3">
        <div className="global-timer-box px-4 py-2 bg-primary text-white rounded-pill">
          <span className="fw-bold">Game Time: </span>
          <span className="timer-count">
            {Math.floor(gameTimeLeft / 60)}:
            {String(gameTimeLeft % 60).padStart(2, "0")}
          </span>
        </div>
      </div>

      <Row className="utu-container-board d-flex justify-content-center">
        <Col xs={12} md={6} className="utu-konva px-4">
          <Board
            pionPositionIndex={pionPositionIndex}
            tanggaUp={tanggaUp}
            snakesDown={snakesDown}
            waitingForAnswer={waitingForAnswer}
            isCorrect={isCorrect || isPotionUsed}
            currentPlayerIndex={currentPlayerIndex}
          />
        </Col>

        <Col
          xs={12}
          md={6}
          className="d-flex flex-column align-items-center justify-content-center px-4 gap-4"
        >
          <PlayerTurnBox
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            showQuestion={showQuestion}
            waitingForAnswer={waitingForAnswer}
            currentQuestion={questions[currentQuestionIndex]}
            onAnswerChange={handleAnswerChange}
            isMyTurn={isMyTurn}
          />

          <div className="timer-player d-flex justify-content-center align-items-center gap-2 mb-3">
            <span className="timer-count">
              {isMyTurn ? timeLeft : playerTimers[currentPlayerIndex] || 30}
            </span>
            <span className="timer-text">Sec</span>
          </div>
          <Dice
            onRollComplete={handleDiceRollComplete}
            disabled={!isMyTurn || isPionMoving || waitingForAnswer}
            diceState={diceState}
            isMyTurn={isMyTurn}
          />

          <Potion
            onUsePotion={handlePotionUse}
            isUsable={
              isMyTurn &&
              potionUsable &&
              !isPotionUsed &&
              showQuestion &&
              waitingForAnswer &&
              (tanggaUp[pionPositionIndex[currentPlayerIndex]] ||
                diceState.lastRoll === 6)
            }
          />
          <PlayerList
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            isMyTurn={isMyTurn}
          />
        </Col>
      </Row>

      {victory &&
        (isWinner ? (
          <VictoryOverlay winner={winner} onClose={handleVictoryClose} />
        ) : (
          <LoseOverlay loser={user.displayName} onClose={handleVictoryClose} />
        ))}
    </Container>
  );
}

export default UlarTangga;
