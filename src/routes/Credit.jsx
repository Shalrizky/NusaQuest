import { Container, Row, Col, Card } from "react-bootstrap";
import "../style/routes/Credit.css";
import Header from "../components/Header";
import LeaderImage from "../assets/common/pakjo-pict.png";
import ManagerImage from "../assets/common/pakgury-pict.png";
import SahelImage from "../assets/common/sahel-pict.png";
import JojoImage from "../assets/common/jojo-pict.png";
import CarloImage from "../assets/common/carlo-pict.png";
import NezaImage from "../assets/common/neza-pict.png";
import ReykiImage from "../assets/common/reyki-pict.png";
import RanggaImage from "../assets/common/rangga-pict.png";
import NatahImage from "../assets/common/natah-pict.png";
import AbeImage from "../assets/common/abe-pict.png";
import RowenImage from "../assets/common/rowen-pict.png";

function Credit() {  
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
                    src={ManagerImage}
                    alt="Project Leader"
                    className="profile-image"
                  />
                </div>

                <h2 className="section-title">Ketua Developer</h2>           
                <div className="profile-image-container">
                  <img 
                    src={SahelImage}
                    alt="Project Leader"
                    className="profile-image"
                  />
                </div>

                <div className="credit-section">
                  <h2 className="section-title">UI/UX Designer</h2>
                  <div className="profile-image-container">                    
                    <div className="profile-item">                                              
                        <img 
                          src={JojoImage} 
                          alt="UI/UX Designer 1"
                          className="profile-image"
                        />                                      
                    </div>
                    
                    <div className="profile-item">                                              
                        <img 
                          src={CarloImage} 
                          alt="UI/UX Designer 2"
                          className="profile-image"
                        />                                          
                    </div>
                    
                    <div className="profile-item">                                              
                        <img 
                          src={NezaImage} 
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
                          src={CarloImage} 
                          alt="UI/UX Designer 1"
                          className="profile-image"
                        />
                    </div>
                    
                    <div className="profile-item">                                              
                        <img 
                          src={NezaImage} 
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
                          src={SahelImage} 
                          alt="UI/UX Designer 1"
                          className="profile-image"
                        />                                             
                    </div>
                    
                    <div className="profile-item">                                      
                        <img 
                          src={ReykiImage} 
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
                          src={RanggaImage} 
                          alt="UI/UX Designer 1"
                          className="profile-image"
                        />                                    
                    </div>
                    
                    <div className="profile-item">                                              
                        <img 
                          src={NatahImage} 
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
                          src={AbeImage} 
                          alt="UI/UX Designer 1"
                          className="profile-image"
                        />                                    
                    </div>
                    
                    <div className="profile-item">                                              
                        <img 
                          src={RowenImage} 
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