import React, { useRef, useEffect } from "react";
import { Card, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "../style/components/cardInformation.css";

const CardInformation = ({ destinations }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const imageRefs = useRef([]);

  useEffect(() => {
    const images = imageRefs.current;

    // Setup GSAP animations for image hover
    const handleMouseEnter = (img) => gsap.to(img, { scale: 1.1, duration: 0.3 });
    const handleMouseLeave = (img) => gsap.to(img, { scale: 1, duration: 0.3 });

    images.forEach((img) => {
      if (img) {
        gsap.set(img, { scale: 1 });
        img.addEventListener("mouseenter", () => handleMouseEnter(img));
        img.addEventListener("mouseleave", () => handleMouseLeave(img));
      }
    });

    // Cleanup event listeners on unmount
    return () => {
      images.forEach((img) => {
        if (img) {
          img.removeEventListener("mouseenter", () => handleMouseEnter(img));
          img.removeEventListener("mouseleave", () => handleMouseLeave(img));
        }
      });
    };
  }, []);

  const handleCardClick = (id) => {
    navigate(`/destination/${id}`);
  };

  const handleDragScroll = () => {
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const mouseDownHandler = (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft = scrollRef.current.scrollLeft;
    };

    const mouseLeaveOrUpHandler = () => {
      isDragging = false;
    };

    const mouseMoveHandler = (e) => {
      if (!isDragging) return;
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

  const dragHandlers = handleDragScroll();

  const shortenDescription = (desc, maxLength = 15) => {
    if (!desc) return "";
    return `${desc.split(" ").slice(0, maxLength).join(" ")} `;
  };

  return (
    <div
      className="scrollable-container"
      ref={scrollRef}
      {...dragHandlers}
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
