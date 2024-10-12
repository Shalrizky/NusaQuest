import { useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import NusaQuestLogo from "../assets/common/nusaQuest-logo.png";
import GoogleLogo from "../assets/common/google-logo.png";
import "../style/routes/Login.css";

function Login() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid id="login-container">
      <Row className="justify-content-center text-center  pt-5">
        <Col lg={12} >
          <img src={NusaQuestLogo} alt="NusaQuest Logo" width={350} />
        </Col>
        <Col lg={5} md={7} sm={8} xs={10} className="text-center pt-2">
          <Card className="login-card p-4 mx-2">
            <Card.Body>
              <Card.Title className="title-card pb-4">
                Welcome to <strong>Nusa Quest</strong>
              </Card.Title>
              <Button
                variant="primary"
                className="btn-login fs-6"
                onClick={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                   <>
                   <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                   {" "}Signing In...
                 </>
                ) : (
                  <>
                    <img src={GoogleLogo} alt="Google Logo" width={25} /> Sign
                    In With Google
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
