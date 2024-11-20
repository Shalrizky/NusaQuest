  import React, { useState, useEffect, useCallback, useRef } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import { Container, Row, Col, Spinner } from "react-bootstrap";
  import useAuth from "../hooks/useAuth";
  import HeaderGame from "../components/games/HeaderGame";
  import Potion from "../components/games/potion";
  // import VictoryOverlay from "../components/games/VictoryOverlay";
  // import LoseOverlay from "../components/games/LoseOverlay";
  import Board from "../components/gamesAi/react-KonvaAi";
  import Dice from "../components/gamesAi/DiceAi";
  import PlayerTurnBox from "../components/games/uTangga/PlayerTurnBox";
  import PlayerList from "../components/games/uTangga/PlayerList";
  // import {
  //   fetchGamePlayers,
  //   initializeGameState,
  //   updateGameState,
  //   listenToGameState,
  //   setGameStatus,
  //   setGameStartStatus,
  //   initializeGameTimer,
  //   cleanupGame,
  //   stopGameTimer,
  //   listenToGameTimer,
  //   getGameState,
  // } from "../services/gameDataServices";
  // import {
  //   getPotionData,
  //   saveNewPotionData,
  // } from "../services/itemsDataServices";
  // import { updateWinningAchievement } from "../services/achievementDataServices";
  // import { usePlayerTimer, useGameTimer } from "../utils/timerUtils";
  // import { getQuestions, shuffle } from "../services/questionDataServices";
  import "../style/routes/UlarTangga.css";

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

  function UtanggaVsAi() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Player and bot initialization
    const [players, setPlayers] = useState([
      { uid: "player1", displayName: user.displayName, isBot: false },
      { uid: "bot", displayName: "Bot", isBot: true },
    ]);

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [pionPositionIndex, setPionPositionIndex] = useState([0, 0]);
    const [diceState, setDiceState] = useState({
      isRolling: false,
      currentNumber: 1,
    });
    const [isPionMoving, setIsPionMoving] = useState(false);
    const [victory, setVictory] = useState(false);
    const [winner, setWinner] = useState("");
    const [diceRolling, setDiceRolling] = useState(false);

    // Helper function to check and handle victory
    const checkVictory = useCallback(
      (newPosition) => {
        if (newPosition === 99) {
          setVictory(true);
          setWinner(players[currentPlayerIndex].displayName);
          return true;
        }
        return false;
      },
      [currentPlayerIndex, players]
    );

    // Handle dice roll completion
    const handleDiceRollComplete = useCallback(
      (diceNumber) => {
        const newPositions = [...pionPositionIndex];
        const currentPos = newPositions[currentPlayerIndex];
        const newPos = Math.min(currentPos + diceNumber, 99);

        setIsPionMoving(true);

        // Move the pion to the new position
        newPositions[currentPlayerIndex] = newPos;

        // Check for victory or ladder/snake conditions
        setTimeout(() => {
          if (checkVictory(newPos)) {
            setPionPositionIndex(newPositions);
            setIsPionMoving(false);
            return;
          }

          const finalPos = tanggaUp[newPos] || snakesDown[newPos] || newPos;
          newPositions[currentPlayerIndex] = finalPos;

          setPionPositionIndex(newPositions);
          setIsPionMoving(false);

          // If dice is not 6, switch turn
          if (diceNumber !== 6) {
            setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
          }
        }, 1000);
      },
      [currentPlayerIndex, pionPositionIndex, checkVictory]
    );

   // Bot logic
   useEffect(() => {
    if (players[currentPlayerIndex].isBot && !victory) {
      setTimeout(() => {
        const botRoll = Math.floor(Math.random() * 6) + 1; // Roll dice secara acak
        
        // Mulai animasi dadu
        setDiceRolling(true);
        setDiceState({ isRolling: true, currentNumber: botRoll });
  
        // Berhenti animasi setelah durasi tertentu
        setTimeout(() => {
          setDiceRolling(false);
          setDiceState({ isRolling: false, currentNumber: botRoll });
          handleDiceRollComplete(botRoll); // Jalankan logic setelah animasi selesai
        }, 1000); // Durasi animasi dadu
      }, 1500); // Delay sebelum giliran bot
    }
  }, [currentPlayerIndex, players, victory, handleDiceRollComplete]);
  

    // Render victory screen
    if (victory) {
      return (
        <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
          <h1>{winner} Wins!</h1>
          <button className="btn btn-primary mt-4" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </Container>
      );
    }

    // Main game UI
    return (
      <Container fluid className="utangga-container d-flex flex-column">
        <HeaderGame layout="home" />
        <Row className="utu-container-board d-flex justify-content-center my-3">
          <Col xs={12} md={6} className="utu-konva px-4">
            <Board
              pionPositionIndex={pionPositionIndex}
              tanggaUp={tanggaUp}
              snakesDown={snakesDown}
              players={players} // Pastikan props ini dikirim ke Board
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
            />

            <Dice
              onRollComplete={(number) => {
                setDiceState({ isRolling: false, currentNumber: number });
                handleDiceRollComplete(number);
              }}
              disabled={
                players[currentPlayerIndex].isBot || isPionMoving || victory
              }
              diceState={diceState}
            />

            <PlayerList
              players={players}
              currentPlayerIndex={currentPlayerIndex}
            />
          </Col>
        </Row>
      </Container>
    );
  }

  export default UtanggaVsAi;
