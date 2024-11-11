import React, { useState, useRef, useEffect } from "react";
import { Card, Col, Image } from "react-bootstrap";
import { Plus, Minus, Award } from "lucide-react";
import { gsap } from "gsap";
import vector from "../assets/common/Vector.png";
import NusaQuestLogo from "../assets/common/nusaQuest-logo.png";
import "../style/components/CardVsAi.css";

const CardVsAi = ({
  username,
  userPhoto,
  achievements,
  badge,
  handlePhotoError,
  onAiCardsChange, // Accept the callback prop
}) => {
  const [aiCards, setAiCards] = useState([false, false, false]);
  const cardRefs = useRef([]);

  // Tambahkan ref untuk kartu pemain utama
  const playerCardRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Ambil nama badge dan total wins, default jika tidak ada untuk user
  const badgeName = badge?.badgeName
    ? badge.badgeName.split(" ")[0] + " " + badge.badgeName.split(" ")[1]
    : "No Badge";
  const totalWins =
    badge?.badgeName && badge.badgeName.match(/\d+/)
      ? parseInt(badge.badgeName.match(/\d+/)[0], 10)
      : 0;

  // UseEffect untuk animasi kartu pemain utama saat komponen dimuat
  useEffect(() => {
    if (!hasAnimated) {
      gsap.fromTo(
        playerCardRef.current,
        { y: -200, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power1.out" }
      );
      setHasAnimated(true);
    }
  }, [hasAnimated]);

  // Notify parent component when AI cards change
  useEffect(() => {
    const aiCount = aiCards.filter((isAi) => isAi).length;
    if (onAiCardsChange) {
      onAiCardsChange(aiCount);
    }
  }, [aiCards, onAiCardsChange]);

  // Handle Click untuk animasi kartu AI saat di klik
  const handleAddAiClick = (index) => {
    const newAiCards = [...aiCards];
    newAiCards[index] = true;
    setAiCards(newAiCards);

    gsap.fromTo(
      cardRefs.current[index],
      { y: -200, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power1.out" }
    );
  };

  const handleRemoveAiClick = (index) => {
    gsap.to(cardRefs.current[index], {
      opacity: 0,
      duration: 0.2,
      ease: "power1.inOut",
      onComplete: () => {
        const newAiCards = [...aiCards];
        newAiCards[index] = false;
        setAiCards(newAiCards);
        gsap.set(cardRefs.current[index], { opacity: 0 });
        gsap.to(cardRefs.current[index], {
          opacity: 1,
          duration: 0.2,
          ease: "power1.out",
        });
      },
    });
  };

  return (
    <Col className="card-vs-ai-container d-flex justify-content-center align-items-center px-4">
      {/* Card untuk Player */}
      <div className="card-wrapper-vs-ai" ref={playerCardRef}>
        <Card className="card-player-vs-ai d-flex justify-content-center align-items-center">
          <Card.Img
            variant="top"
            src={userPhoto}
            className="img-card-player-vs-ai"
            onError={handlePhotoError}
          />
          <Card.Body>
            <Card.Title className="title">{username}</Card.Title>

            {badge?.iconURL ? (
              <div className="badge-section-vs-ai mt-3 text-start">
                <Image
                  src={badge.iconURL}
                  alt="Badge Icon"
                  className="badge-image-vs-ai"
                />
                <span className="badge-card-title-vs-ai">
                  {badgeName} {totalWins ? `(${totalWins} Wins)` : ""}
                </span>
              </div>
            ) : (
              <div className="badge-section-vs-ai mt-3 text-start">
                <span className="badge-card-title-vs-ai">No Badge</span>
              </div>
            )}

            {/* Bagian Achievement */}
            {totalWins >= 5 && achievements?.achievement_name ? (
              <div className="achievement-section-vs-ai mt-3 text-start">
                <Image
                  src={achievements.achievement_trophy}
                  alt="Achievement Image"
                  className="achievement-image-vs-ai"
                />
                <span className="achievement-name-vs-ai">
                  {achievements.achievement_name}
                </span>
              </div>
            ) : (
              <div className="achievement-section-vs-ai mt-3 text-start">
                <Award className="achievement-image empty-icon-vs-ai" />
                <span className="achievement-name-vs-ai">No Achievement</span>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Card untuk AI atau Add AI */}
      {aiCards.map((isAiAdded, index) => (
        <div
          key={index}
          className={isAiAdded ? "card-wrapper-vs-ai" : "card-wrapper-add-ai"}
          ref={(cardRef) => (cardRefs.current[index] = cardRef)}
        >
          <Card className={isAiAdded ? "card-ai" : "card-add-ai"}>
            <Card.Body className="d-flex flex-column justify-content-top align-items-center text-center gap-3 mt-5">
              {isAiAdded ? (
                <>
                  <Card.Img
                    src={NusaQuestLogo}
                    className="img-card-ai img-fluid"
                  />
                  <Card.Title className="title">Computer AI</Card.Title>
                  <Minus
                    size={50}
                    style={{ cursor: "pointer", color: "#ff5757" }}
                    onClick={() => handleRemoveAiClick(index)}
                  />
                </>
              ) : (
                <>
                  <Image
                    src={vector}
                    className="img-card-add-ai img-fluid"
                    width={80}
                  />
                  <Plus
                    size={50}
                    style={{ cursor: "pointer", color: "rgb(171, 171, 171)" }}
                    onClick={() => handleAddAiClick(index)}
                  />
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      ))}
    </Col>
  );
};

export default CardVsAi;
