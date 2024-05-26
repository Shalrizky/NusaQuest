import { useState, useEffect } from "react";
import useAuth from "../lib/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import ImageLoader from "../components/common/ImageLoader";
import NusaQuestLogo from "../assets/common/nusaQuest-logo.png";
import GoogleLogo from "../assets/common/google-logo.png";
import "../style/routes/Login.css";

function Login() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null); 
    try {
      await signInWithGoogle();
      if (localStorage.getItem("isLoggedIn") === "true") {
        navigate("/");
      }
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("User cancelled the sign-in process");
        setError("Sign-in cancelled. Please try again.");
      } else {
        console.error("Error signing in:", error);
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <Container fluid id="login-container">
      <ImageLoader srcList={[NusaQuestLogo, GoogleLogo]}>
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
                {error && <Alert variant="danger">{error}</Alert>}
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
      </ImageLoader>
    </Container>
  );
}

export default Login;
