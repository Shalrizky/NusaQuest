import React, { useEffect, useRef, useState } from "react";
import { Card, Col, Image } from "react-bootstrap";
import vector from "../assets/common/Vector.png";
import { Award } from "lucide-react";
import { gsap } from "gsap";
import "../style/components/CardPlayer.css";

const CardPlayer = ({
  username,
  userPhoto,
  achievements,
  badge,
  handlePhotoError,
  isAvailable = true,
  isNew = false,
  playerIndex
}) => {
  const cardRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isAvailable && isNew && playerIndex !== 0 && !hasAnimated) {
      gsap.fromTo(
        cardRef.current,
        { y: -200, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power1.out" }
      );
      setHasAnimated(true);
    }
  }, [isAvailable, isNew, hasAnimated, playerIndex]);

  if (!isAvailable) {
    return (
      <Col className="card-player-container d-flex justify-content-center align-items-center px-4">
        <div className="card-wrapper-notavail">
          <Card className="player-not-available">
            <Card.Body className="d-flex flex-column justify-content-top align-items-center mt-5 text-center gap-3">
              <Image src={vector} className="img-card-notavail img-fluid" width={80} />
              <Card.Title className="title">Menunggu Pemain Lain Untuk Masuk</Card.Title>
            </Card.Body>
          </Card>
        </div>
      </Col>
    );
  }

  const badgeName = badge?.badgeName
    ? badge.badgeName.split(" ")[0] + " " + badge.badgeName.split(" ")[1]
    : "No Badge";
  const totalWins =
    badge?.badgeName && badge.badgeName.match(/\d+/)
      ? parseInt(badge.badgeName.match(/\d+/)[0], 10)
      : 0;

  return (
    <Col className="card-player-container d-flex justify-content-center align-items-center px-4">
      <div className="card-wrapper" ref={cardRef}>
        <Card className="card-player d-flex justify-content-center align-items-center">
          <Card.Img
            variant="top"
            src={userPhoto || vector}
            className="img-card-player"
            onError={handlePhotoError}
          />
          <Card.Body>
            <Card.Title className="title">{username || "Pemain Tidak Dikenal"}</Card.Title>
            {badge?.iconURL ? (
              <div className="badge-section mt-3 text-start">
                <Image src={badge.iconURL} alt="Badge Icon" className="badge-image" />
                <span className="badge-card-title">
                  {badgeName} {totalWins ? `(${totalWins} Wins)` : ""}
                </span>
              </div>
            ) : (
              <div className="badge-section mt-3 text-start">
                <span className="badge-card-title">No Badge</span>
              </div>
            )}
            {totalWins >= 5 && achievements?.achievement_name ? (
              <div className="achievement-section mt-3 text-start">
                <Image src={achievements.achievement_trophy} alt="Achievement Image" className="achievement-image" />
                <span className="achievement-name">{achievements.achievement_name}</span>
              </div>
            ) : (
              <div className="achievement-section mt-3 text-start">
                <Award className="achievement-image empty-icon" />
                <span className="achievement-name">No Achievement</span>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </Col>
  );
};

export default CardPlayer;