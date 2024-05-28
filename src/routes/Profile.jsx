import useAuth from "../lib/hooks/useAuth";
import { UserRound } from "lucide-react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import BackIcon from "../assets/common/back-icon.png";
import "../style/routes/Profile.css";

function Profile() {
  const { logout, user } = useAuth();

  // Handle logout action
  const handleLogOut = () => {
    logout();
  };

  // Return null if user data is not available
  if (!user) {
    return null;
  }

  return (
    <Container fluid id="profile-container">
      <Header layout="profile" backIcon={BackIcon} profileText="PROFILE" />
      <Row className="d-flex justify-content-center pt-2">
        <Col md={4} className="d-flex align-items-center">
          <Card id="profile-card" className="w-100 h-100 text-center py-4">
            <Card.Body id="profile-card-content" className="d-grid gap-5">
              {user.photoURL ? (
                <Card.Img
                  id="img-profile"
                  src={user.photoURL}
                  className="mx-auto"
                />
              ) : (
                <UserRound
                  fill="#D8D8D4"
                  strokeWidth={0}
                  width={100}
                  height={100}
                />
              )}
              <Card.Title className="text-white">
                <h3>{user.displayName}</h3>
                <h5>{user.email}</h5>
              </Card.Title>
              <div className="d-grid gap-2">
                <Button variant="primary" size="md">
                  Edit Profile
                </Button>
                <Button variant="danger" size="md" onClick={handleLogOut}>
                  Logout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8} className="d-flex align-items-center">
          <Card id="profile-card" className="w-100 h-100 text-center">
            <Card.Body
              id="profile-card-content"
              className="d-flex flex-column justify-content-center"
            >
              <Card.Title className="title-card pb-4">Achievement</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Footer textColor={"#fff"} />
    </Container>
  );
}

export default Profile;