import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import NusaQuestLogo from "../assets/common/nusaQuest-logo.png";
import GoogleLogo from "../assets/common/google-logo.png";
import "../style/routes/Login.css";

function Login() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in, if so, redirect to home page
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  // Handle Google sign-in
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
                  "Signing In..."
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
