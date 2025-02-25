import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import HeaderGame from "../components/games/HeaderGame";
import BackStackCard from "../components/games/nuca/BackStackCard";
import PlayingStackCard from "../components/games/nuca/PlayingStackCard";
import NotAvailPlayer from "../assets/games/nuca/notAvailPlayerNuca.png";
import "../style/routes/NusaCard.css";

function NusaCard() {
  const [gameState, setGameState] = useState({
    player1Cards: [
      { question: "Gado Gado adalah makanan khas dari daerah mana:" },
      {
        question:
          "Apa yang menjadi sayur asam sedap dan enak untuk disajikan dengan hangat?",
      },
      {
        question: "Untuk memasak serabi khas Bandung biasanya menggunakan apa?",
      },
      { question: "Berapa lama proses memasak sate maranggi?" },
      {
        question:
          "Siapa penemu dodol dan bagaimana sejarahnya hingga menjadi makanan tradisional?",
      },
    ],
    player2Cards: 5, 
    player3Cards: 5,
    player4Cards: 5, 
    playerStatus: {
      player2: "navailable", 
      player3: "available", 
      player4: "not_available", 
    },
  });

  return (
    <div className="nusa-page">
      <HeaderGame layout="home" />

      <Container
        fluid
        id="nuca-container"
        className="flex-grow-1 d-flex flex-column justify-content-between"
      >
        {/* Player 3 (Top) */}
        <Row className="justify-content-center align-items-center">
          <Col xs="auto">
            <BackStackCard
              totalCards={gameState.player3Cards}
              position="top"
              showNotAvail={gameState.playerStatus.player3 === "not_available"}
              notAvailImage={NotAvailPlayer}
            />
          </Col>
        </Row>

        {/* Player 2 (Left), Middle Deck, Player 4 (Right) */}
        <Row className="d-flex justify-content-between align-items-center mx-3 mx-lg-4">
          <Col md={4}>
            <BackStackCard
              totalCards={gameState.player2Cards}
              position="left"
              showNotAvail={gameState.playerStatus.player2 === "not_available"}
              notAvailImage={NotAvailPlayer}
            />
          </Col>

          <Col
            md={4}
            className="d-flex justify-content-center align-items-center"
          >
            <BackStackCard
              totalCards={5}
              position="middle"
              showShuffle={true}
            />
          </Col>

          <Col md={4}>
            <BackStackCard
              totalCards={gameState.player4Cards}
              position="right"
              showNotAvail={gameState.playerStatus.player4 === "not_available"}
              notAvailImage={NotAvailPlayer}
            />
          </Col>
        </Row>

        {/* Player 1 (Bottom) */}
        <Row className="justify-content-center align-items-center mb-4">
          <Col xs="auto">
            <PlayingStackCard cards={gameState.player1Cards} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default NusaCard;