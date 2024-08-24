import React, { useRef, useEffect } from "react";
import { Card, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "../style/components/cardInformation.css";

const CardInformation = ({ destinations }) => {
  const scrollRef = useRef();
  const navigate = useNavigate();
  const imageRefs = useRef([]);

  useEffect(() => {
    imageRefs.current.forEach((img, index) => {
      if (img) {
        gsap.set(img, { scale: 1 });
        img.addEventListener("mouseenter", () => {
          gsap.to(img, { scale: 1.1, duration: 0.3 });
        });
        img.addEventListener("mouseleave", () => {
          gsap.to(img, { scale: 1, duration: 0.3 });
        });
      }
    });
  }, []);

  const handleCardClick = (key) => {
    navigate(`/destination/${key}`);
  };

  const handleDragScroll = () => {
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const mouseDownHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      startX = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft = scrollRef.current.scrollLeft;
      scrollRef.current.style.userSelect = "none";
    };

    const mouseLeaveOrUpHandler = () => {
      isDragging = false;
      scrollRef.current.style.userSelect = "";
    };

    const mouseMoveHandler = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    return {
      onMouseDown: mouseDownHandler,
      onMouseLeave: mouseLeaveOrUpHandler,
      onMouseUp: mouseLeaveOrUpHandler,
      onMouseMove: mouseMoveHandler,
    };
  };

  const handlers = handleDragScroll();

  const shortenDescription = (desc, maxLength = 15) => {
    if (!desc) return "";
    return desc.split(" ").slice(0, maxLength).join(" ") + " ";
  };

  return (
    <div
      className="scrollable-container"
      onMouseDown={handlers.onMouseDown}
      onMouseLeave={handlers.onMouseLeave}
      onMouseUp={handlers.onMouseUp}
      onMouseMove={handlers.onMouseMove}
      ref={scrollRef}
    >
      {destinations.map((destination, index) => (
        <div key={destination.id} className="scrollable-item">
          <Card className="destination-card">
            <Card.Body>
              <Image
                src={destination.img}
                alt={destination.name}
                ref={(el) => (imageRefs.current[index] = el)}
                onClick={() => handleCardClick(destination.id)}
              />
              <div className="px-2 pt-3 d-flex flex-column justify-content-center">
                <Card.Title>{destination.name}</Card.Title>
                <Card.Text>
                  {shortenDescription(destination.description)}
                  <span onClick={() => handleCardClick(destination.id)}>
                    See Details
                  </span>
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default CardInformation;
