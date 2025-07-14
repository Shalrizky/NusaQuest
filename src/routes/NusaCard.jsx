import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import HeaderGame from "../components/games/HeaderGame";
import BackStackCard from "../components/games/nuca/BackStackCard";
import PlayingStackCard from "../components/games/nuca/PlayingStackCard";
import SentCard from "../components/games/nuca/SentCardPlayer";
import PlayerProfileNuca from "../components/games/nuca/PlayerProfileNuca";
import NotAvailPlayer from "../assets/games/nuca/notAvailPlayerNuca.png";
import ModalQuestion from "../components/games/nuca/ModalQuestion"; // Pastikan import ini benar
import "../style/routes/NusaCard.css";

function NusaCard() {
  const [gameState, setGameState] = useState({
    player1Cards: [
      {
        id: 1,
        question_text: "Gado Gado adalah makanan khas dari daerah mana:",
        multiple_choices: [
          { answer_text: "Jakarta", is_correct: true },
          { answer_text: "Surabaya", is_correct: false },
          { answer_text: "Bandung", is_correct: false },
          { answer_text: "Solo", is_correct: false },
        ],
        hint: "Ibu kota Indonesia",
      },
      {
        id: 2,
        question_text:
          "Apa yang menjadi sayur asam sedap dan enak untuk disajikan dengan hangat?",
        multiple_choices: [
          { answer_text: "Sayur Lodeh", is_correct: false },
          { answer_text: "Sayur Asem", is_correct: true },
          { answer_text: "Tumis Kangkung", is_correct: false },
          { answer_text: "Gulai Nangka", is_correct: false },
        ],
        hint: "Rasanya segar dan cocok dengan nasi",
      },
      {
        id: 3,
        question_text:
          "Untuk memasak serabi khas Bandung biasanya menggunakan apa?",
        multiple_choices: [
          { answer_text: "Tepung Beras", is_correct: true },
          { answer_text: "Tepung Terigu", is_correct: false },
          { answer_text: "Sagu", is_correct: false },
          { answer_text: "Jagung", is_correct: false },
        ],
        hint: "Terbuat dari padi",
      },
      {
        id: 4,
        question_text: "Berapa lama proses memasak sate maranggi?",
        multiple_choices: [
          { answer_text: "10 menit", is_correct: false },
          { answer_text: "30 menit", is_correct: true },
          { answer_text: "1 jam", is_correct: false },
          { answer_text: "2 jam", is_correct: false },
        ],
        hint: "Waktunya sedang, tidak terlalu lama",
      },
      {
        id: 5,
        question_text:
          "Siapa penemu dodol dan bagaimana sejarahnya hingga menjadi makanan tradisional?",
        multiple_choices: [
          { answer_text: "Tidak diketahui", is_correct: true },
          { answer_text: "Sunan Kalijaga", is_correct: false },
          { answer_text: "Prabu Siliwangi", is_correct: false },
          { answer_text: "Raden Wijaya", is_correct: false },
        ],
        hint: "Asal usulnya sudah sangat lama",
      },
    ],
    player2Cards: 5,
    player3Cards: 5,
    player4Cards: 5,
    playerStatus: {
      player2: "available",
      player3: "not_available",
      player4: "not_available",
    },
  });

  const [userProfile] = useState({});
  const [sentCard, setSentCard] = useState(null);

  // State untuk Modal Pertanyaan
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestionForModal, setCurrentQuestionForModal] = useState(null);
  const [collectedHints, setCollectedHints] = useState([]);

  // STATE UNTUK OFFCANVAS
  const [showOffcanvas, setShowOffcanvas] = useState(false); 
  const handleCloseOffcanvas = () => setShowOffcanvas(false); 

  // Fungsi untuk playing  card di klik
  const handleP1CardClicked = (cardData, originalIndex) => {
    setSentCard(cardData);
    setCurrentQuestionForModal(cardData);
    setShowQuestionModal(true);

    setTimeout(() => {
      setGameState((prevState) => {
        const newCards = prevState.player1Cards.filter(
          (card) => card.id !== cardData.id
        );
        return {
          ...prevState,
          player1Cards: newCards,
        };
      });
    }, 1000);
  };

  // FUNGSI UNTUK MENAMPILKAN HINTS DAN OFFCAVAS
  const handleAnswerSubmittedByPlayer = (result) => {
    const { isCorrect, hint } = result;
    //console.log("Answer received by NusaCard. Correct:", isCorrect, "Hint:", hint);

    if (!isCorrect && hint) {
      setCollectedHints((prevHints) => {
        if (!prevHints.includes(hint)) {
          return [...prevHints, hint];
        }
        return prevHints;
      });
      setShowOffcanvas(true);
    } else if (isCorrect) {
      console.log("Jawaban benar!");
    }
  };

  const handleCloseQuestionModal = () => {
    setShowQuestionModal(false);
    setCurrentQuestionForModal(null); 
    setSentCard(null); 
    // Lanjutkan alur game setelah modal ditutup (misal giliran pemain lain)
  };

  return (
    <div className="nusa-page d-flex flex-column">
      <HeaderGame
        hints={collectedHints}
        showOffcanvas={showOffcanvas}
        setShowOffcanvas={setShowOffcanvas} 
        onCloseOffcanvas={handleCloseOffcanvas}
      />

      <Container
        fluid
        id="nuca-container"
        className="flex-grow-1 d-flex flex-column justify-content-between"
      >
        {/* Player 3 (Top) */}
        <Row className="justify-content-center align-items-center">
          <Col xs="auto" className="position-relative">
            {gameState.playerStatus.player3 === "available" && (
              <PlayerProfileNuca
                userProfile={userProfile}
                position="top-left"
                totalCards={gameState.player3Cards}
              />
            )}
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
            <div className="position-relative">
              {gameState.playerStatus.player2 === "available" && (
                <PlayerProfileNuca
                  userProfile={userProfile}
                  position="left"
                  totalCards={gameState.player2Cards}
                />
              )}
              <BackStackCard
                totalCards={gameState.player2Cards}
                position="left"
                showNotAvail={
                  gameState.playerStatus.player2 === "not_available"
                }
                notAvailImage={NotAvailPlayer}
              />
            </div>
          </Col>

          <Col
            md={4}
            className="d-flex justify-content-center align-items-center position-relative"
          >
            <BackStackCard
              totalCards={5}
              position="middle"
              showShuffle={true}
            />
            {/* Kartu Tengah Yang di sent oleh pemain*/}
            {sentCard && <SentCard cardData={sentCard} />}
          </Col>

          <Col md={4}>
            <div className="position-relative">
              {gameState.playerStatus.player4 === "available" && (
                <PlayerProfileNuca
                  userProfile={userProfile}
                  position="right"
                  totalCards={gameState.player4Cards}
                />
              )}
              <BackStackCard
                totalCards={gameState.player4Cards}
                position="right"
                showNotAvail={
                  gameState.playerStatus.player4 === "not_available"
                }
                notAvailImage={NotAvailPlayer}
              />
            </div>
          </Col>
        </Row>

        {/* Player 1 (Bottom) */}
        <Row className="d-flex justify-content-center align-items-center mb-4">
          <Col xs="auto" className="position-relative">
            <PlayingStackCard
              cards={gameState.player1Cards}
              onCardClick={handleP1CardClicked}
            />
            <PlayerProfileNuca
              userProfile={userProfile}
              position="bottom-right"
              totalCards={gameState.player1Cards.length}
            />
          </Col>
        </Row>
      </Container>

      {/* Modal Pertanyaan */}
      <ModalQuestion
        show={showQuestionModal}
        questionData={currentQuestionForModal}
        onClose={handleCloseQuestionModal}
        onSubmitAnswer={handleAnswerSubmittedByPlayer}
        isMyTurn={true} // Anda bisa membuat ini dinamis dari state game jika ada giliran pemain
      />
    </div>
  );
}

export default NusaCard;
