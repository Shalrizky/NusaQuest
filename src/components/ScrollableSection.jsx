import React, { useRef, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import '../style/components/scroll.css';

const ScrollableSection = ({ topicId, category, destinations, shortenDescription }) => {
  const scrollRef = useRef();

  useEffect(() => {
    console.log(`Scrollable section for ${topicId}-${category} mounted.`);
  }, [topicId, category]);

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
      scrollRef.current.style.userSelect = 'none';
    };

    const mouseLeaveOrUpHandler = () => {
      isDragging = false;
      scrollRef.current.style.userSelect = '';
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

  return (
    <div
      className="scrollable-container information-content"
      onMouseDown={handlers.onMouseDown}
      onMouseLeave={handlers.onMouseLeave}
      onMouseUp={handlers.onMouseUp}
      onMouseMove={handlers.onMouseMove}
      ref={scrollRef}
    >
      {destinations.map((destination, index) => (
        <div key={index} className="scrollable-item">
          <Card className="destination-card">
            <Card.Body>
            <img  src={destination.img} alt={destination.name}  />
              <Card.Title>{destination.name}</Card.Title>
              <Card.Text>{shortenDescription(destination.desc)}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default ScrollableSection;
