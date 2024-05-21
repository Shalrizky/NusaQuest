import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../util/AuthContext";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import NusaQuestLogo from "../assets/general/nusaQuest-logo.png";
import GoogleLogo from "../assets/general/google-logo.png";
import ImageLoader from "../util/ImageLoader";
import "../style/routes/Login.css";
import { useState, useEffect } from "react";
import app from "../firebaseConfig";

function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn, setUser } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDetails = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      };

      saveUserData(userDetails);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false);
    }
  };

  const saveUserData = (userDetails) => {
    const db = getDatabase(app);
    const usersRef = ref(db, "users/" + userDetails.uid);

    set(usersRef, userDetails)
      .then(() => {
        console.log("User data saved successfully!");
        setLoading(false);
        setIsLoggedIn(true);
        setUser(userDetails);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(userDetails));
        navigate("/");
      })
      .catch((error) => {
        console.error("Error saving user data: ", error);
        setLoading(false);
      });
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
                <Button
                  variant="primary"
                  className="btn-login fs-6"
                  onClick={handleGoogleSignIn}
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
