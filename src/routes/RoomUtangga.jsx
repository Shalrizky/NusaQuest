import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAuth } from "../util/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackIcon from "../assets/general/back-icon.png";
import userProfile from "../assets/general/user-profile.jpg";
import ImageLoader from "../util/ImageLoader";
import "../style/routes/RoomUtangga.css"; // Ensure the path and case are correct
import roomUtanggaLogo from "../assets/general/roomUtangga.png"; 



function RoomUtangga() {
    return (
      <div className="room-utangga-container">
        <Container>
          <Row>
            <Col md={8}>
              <h1>PERMAINAN ULAR TANGGA</h1><br>
              </br>
              <h5><p>Cara Bermain :</p></h5>
              <ol>
                <li>
                  Pilih salah satu dari lima room yang tersedia,<br>
                  </br>
                  mulai dari Room 1 hingga Room 5.
                </li>
                <li>
                  Tunggu hingga pemain lain bergabung di room yang sama dengan<br>
                  </br>
                  minimal 2 pemain dan maksimal 4 pemain.
                </li>
                <li>
                  Permainan dimulai dengan setiap pemain secara bergantian<br>
                  </br>
                  melempar pertanyaan pilihan ganda yang telah disediakan terkait<br>
                  </br>
                  topik pada dek kartu, dengan masing-masing pemain mendapatkan<br>
                  </br> lima kartu pertanyaan.
                </li>
              </ol>
              <Button variant="secondary" className="mt-3">Select Room</Button>
            </Col>
            <Col md={4} className="d-flex justify-content-center align-items-center">
              <Card className="text-center bg-transparent border-0">
                <Card.Img src={roomUtanggaLogo} alt="Nusa Quest Logo" className="room-utangga-logo" />
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
  
  export default RoomUtangga;