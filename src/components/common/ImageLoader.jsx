import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";

function ImageLoader({ srcList, children }) {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const images = srcList.map((src) => {
      const img = new window.Image();
      img.src = src;
      return img;
    });

    const checkIfAllLoaded = () => {
      if (images.every((img) => img.complete) && isMounted) {
        setImagesLoaded(true);
      }
    };

    images.forEach((img) => {
      img.onload = checkIfAllLoaded;
      img.onerror = checkIfAllLoaded; 
    });
    
    checkIfAllLoaded();

    return () => {
      isMounted = false; 
    };
  }, [srcList]);

  return imagesLoaded ? (
    children
  ) : (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

export default ImageLoader;
