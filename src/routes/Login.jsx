import "../style/Login.css";
//TODO Import firebase belum dideklarasikan untuk kebutuhan login
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import NusaQuestLogo from "../assets/general/nusaQuest-logo.png";
import GoogleLogo from "../assets/general/google-logo.png";

function Login ()  {

  //TODO: Membuat logika login dengan firebase

  return (
    <Container fluid id="login-container">
      <Row className="justify-content-center pb-5 pt-2">
        <Col lg={12} className="text-center">
          <img src={NusaQuestLogo} alt="NusaQuest Logo" width={350} />
        </Col>
        <Col lg={5} md={7} sm={8} xs={10} className="text-center pt-4">
          <Card className="login-card p-4 mx-2">
            <Card.Body>
              <Card.Title className="title-card pb-4">
                Welcome to <strong>Nusa Quest</strong>
              </Card.Title>
              <Button variant="primary" className="btn-login fs-6 ">
                <img src={GoogleLogo} alt="Google Logo" width={25}/> Sign In
                With Google
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
