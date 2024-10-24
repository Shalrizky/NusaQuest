import React, { useState, useRef } from "react";
import { Card, Col, Image } from "react-bootstrap";
import { Plus, Minus } from "lucide-react";
import { gsap } from "gsap";
import ImagePlayer from "../assets/common/image-player-1.png";
import NusaQuestLogo from "../assets/common/nusaQuest-logo.png";
// import badge1 from "../assets/common/badge.png";
import vector from "../assets/common/Vector.png";
import "../style/components/CardVsAi.css";

const CardVsAi = () => {
  const [aiCards, setAiCards] = useState([false, false, false]);
  const cardRefs = useRef([]);

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
      <div className="card-wrapper-vs-ai">
        <Card className="card-player-vs-ai d-flex justify-content-center align-items-center">
          <Card.Img
            variant="top"
            src={ImagePlayer}
            className="img-card-player-vs-ai"
          />
          <Card.Body>
            <Card.Title className="title">KAMAL ABRAR</Card.Title>
            <div className="d-flex flex-lg-row flex-column align-items-center gap-1 text-center">
              {/* <Image src={badge1} alt="badge" className="badge-image-vs-ai" /> */}
              <span className="badge-card-title-vs-ai">Master Kuliner</span>
            </div>
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
