import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Card } from "react-bootstrap";
import "../style/routes/Credit.css";
import LeaderImage from "../assets/common/pakjo-pict.png";

function Credit() {  
  const creditRef = useRef(null);  // Mengacu pada kontainer scrollable
  const contentRef = useRef(null);  // Mengacu pada konten yang di-scroll
  const [isAutoScrolling, setIsAutoScrolling] = useState(true); // Menyimpan status apakah auto-scroll aktif atau tidak

  useEffect(() => {
    const creditContainer = creditRef.current;
    const contentContainer = contentRef.current;
    if (!creditContainer || !contentContainer) return;

    let lastScrollTop = 0; // Menyimpan posisi scroll terakhir
    const totalHeight = contentContainer.scrollHeight - creditContainer.clientHeight;
    let scrollSpeed = 0.5; // Kecepatan scroll otomatis

    // Fungsi untuk animasi scroll otomatis
    const autoScroll = () => {
      if (!isAutoScrolling) return; // Jangan jalankan auto-scroll jika pengguna sedang scroll manual

      lastScrollTop += scrollSpeed;

      // Reset ke posisi atas jika sudah mencapai akhir
      if (lastScrollTop >= totalHeight) {
        lastScrollTop = 0;
      }

      // Mengupdate posisi scroll secara otomatis
      creditContainer.scrollTop = lastScrollTop;

      // Menjalankan auto-scroll menggunakan requestAnimationFrame untuk animasi mulus
      requestAnimationFrame(autoScroll);
    };

    // Fungsi untuk mengaktifkan kembali auto-scroll setelah tidak ada interaksi
    const restartAutoScroll = () => {
      setTimeout(() => {
        setIsAutoScrolling(true); // Aktifkan kembali auto-scroll
      }, 5000);
    };

    // Event listener untuk mendeteksi scroll manual
    const handleManualScroll = () => {
      setIsAutoScrolling(false); // Hentikan auto-scroll jika pengguna scroll manual
    };

    // Memulai animasi autoscroll
    requestAnimationFrame(autoScroll);

    // Menambahkan event listener untuk scroll manual
    creditContainer.addEventListener('scroll', handleManualScroll);
    creditContainer.addEventListener('scroll', restartAutoScroll);

    // Cleanup saat komponen unmount
    return () => {
      creditContainer.removeEventListener('scroll', handleManualScroll);
      creditContainer.removeEventListener('scroll', restartAutoScroll);
    };
  }, [isAutoScrolling]);  // Menambahkan isAutoScrolling ke dalam dependency

  return (
    <Container fluid id="credit-container">
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

                <div className="credit-section">
                  <h2 className="section-title">Back End Developer</h2>
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
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Credit;