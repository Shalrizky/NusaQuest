import React, { useEffect, useRef } from 'react';
import { Container, Row, Col, Card } from "react-bootstrap";
import "../style/routes/Credit.css";
import gsap from "gsap";
import Header from "../components/Header";
import LeaderImage from "../assets/common/pakjo-pict.png";

function Credit() {  
  const creditCardRef = useRef(null); // Menggunakan creditCardRef yang benar

  useEffect(() => {
    const creditContainer = creditCardRef.current; // Menggunakan creditCardRef di sini

    if (!creditContainer) {
      console.log("creditContainer not found"); // Log jika elemen tidak ditemukan
      return;
    }

    console.log("creditContainer found", creditContainer); // Log jika elemen ditemukan

    // Menggunakan animasi y untuk scroll vertikal
    const scrollAnimation = gsap.to(creditContainer, {
      y: -creditContainer.scrollHeight + creditContainer.clientHeight, // Gerakan scroll vertikal
      duration: 20,
      ease: "linear",
      repeat: -1,
      yoyo: true,
    });

    const handleMouseEnter = () => scrollAnimation.pause(); // Pause animasi saat mouse masuk
    const handleMouseLeave = () => scrollAnimation.play(); // Play animasi saat mouse keluar

    creditContainer.addEventListener("mouseenter", handleMouseEnter); // Event listener untuk mouse enter
    creditContainer.addEventListener("mouseleave", handleMouseLeave); // Event listener untuk mouse leave

    return () => {
      // Bersihkan event listeners dan animasi saat komponen dibersihkan
      creditContainer.removeEventListener("mouseenter", handleMouseEnter);
      creditContainer.removeEventListener("mouseleave", handleMouseLeave);
      scrollAnimation.kill();
    };
  }, []); // Efek hanya dijalankan sekali saat komponen di-mount

  return (
    <Container fluid id="credit-container">
      <Header showLogoIcon={false} showIcons={false} showBackIcon={true} />
      <Row className="d-flex align-items-center justify-content-center">
        <Col md="12" className="d-flex align-items-center justify-content-center">
          <Card className="credit-card">
            <Card.Body>
              <div className="credit-content">
                <h1 className="credit-title">Credit</h1>
                <hr className="title-line" />   

                <h2 className="section-title">Project Leader</h2>           
                <div className="profile-image-container">
                  <img 
                    src={LeaderImage}
                    alt="Project Leader"
                    className="profile-image"
                  />
                </div>

                <h2 className="section-title">Project Manager</h2>           
                <div className="profile-image-container">
                  <img 
                    src={LeaderImage}
                    alt="Project Leader"
                    className="profile-image"
                  />
                </div>

                <h2 className="section-title">Ketua Developer</h2>           
                <div className="profile-image-container">
                  <img 
                    src={LeaderImage}
                    alt="Project Leader"
                    className="profile-image"
                  />
                </div>

                <div className="credit-section">
                  <h2 className="section-title">UI/UX Designer</h2>
                  <div className="profile-image-container">                    
                    <div className="profile-item">                                              
                        <img 
                          src={LeaderImage} 
                          alt="UI/UX Designer 1"
                          className="profile-image"
                        />                                      
                    </div>
                    
                    <div className="profile-item">                                              
                        <img 
                          src={LeaderImage} 
                          alt="UI/UX Designer 2"
                          className="profile-image"
                        />                                          
                    </div>
                    
                    <div className="profile-item">                                              
                        <img 
                          src={LeaderImage} 
                          alt="UI/UX Designer 3"
                          className="profile-image"
                        />                                                       
                    </div>
                  </div>
                </div>

                <div className="credit-section">
                  <h2 className="section-title">Asset Game Developer</h2>
                  <div className="profile-image-container">                    
                    <div className="profile-item">                      
                        <img 
                          src={LeaderImage} 
                          alt="UI/UX Designer 1"
                          className="profile-image"
                        />
                    </div>
                    
                    <div className="profile-item">                                              
                        <img 
                          src={LeaderImage} 
                          alt="UI/UX Designer 2"
                          className="profile-image"
                        />                                                              
                    </div>                    
                  </div>
                </div>

                <div className="credit-section">
                  <h2 className="section-title">Full Stack Developer</h2>
                  <div className="profile-image-container">                    
                    <div className="profile-item">                                              
                        <img 
                          src={LeaderImage} 
                          alt="UI/UX Designer 1"
                          className="profile-image"
                        />                                             
                    </div>
                    
                    <div className="profile-item">                                      
                        <img 
                          src={LeaderImage} 
                          alt="UI/UX Designer 2"
                          className="profile-image"
                        />                                                                
                    </div>                    
                  </div>
                </div>

                <div className="credit-section">
                  <h2 className="section-title">Front End Developer</h2>
                  <div className="profile-image-container">                    
                    <div className="profile-item">                                              
                        <img 
                          src={LeaderImage} 
                          alt="UI/UX Designer 1"
                          className="profile-image"
                        />                                    
                    </div>
                    
                    <div className="profile-item">                                              
                        <img 
                          src={LeaderImage} 
                          alt="UI/UX Designer 2"
                          className="profile-image"
                        />                                                                
                    </div>                    
                  </div>
                </div>

                <div className="credit-section ">
                  <h2 className="section-title">Back End Developer</h2>
                  <div className="profile-image-container ">                    
                    <div className="profile-item mb-5">                                              
                        <img 
                          src={LeaderImage} 
                          alt="UI/UX Designer 1"
                          className="profile-image"
                        />                                    
                    </div>
                    
                    <div className="profile-item">                                              
                        <img 
                          src={LeaderImage} 
                          alt="UI/UX Designer 2"
                          className="profile-image"
                        />                                                  
                    </div>                    
                  </div>
                </div>                
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Credit;