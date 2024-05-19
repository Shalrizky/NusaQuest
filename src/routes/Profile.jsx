import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackIcon from "../assets/general/back-icon.png";
import userProfile from "../assets/general/user-profile.jpg";
import ImageLoader from "../util/ImageLoader";
import "../style/routes/Profile.css";

function Profile() {
  return (
    <Container fluid id="profile-container">
      <Header layout="profile" backIcon={BackIcon} profileText="PROFILE" />
      <ImageLoader srcList={[BackIcon, userProfile]}>
        <Row className="d-flex justify-content-center pt-2">
          <Col md={4} className="d-flex align-items-center">
            <Card id="profile-card" className="w-100 h-100 text-center py-4">
              <Card.Body id="profile-card-content" className="d-grid gap-5">
                <Card.Img
                  id="img-profile"
                  src={userProfile}
                  className="mx-auto"
                />
                <Card.Title className="text-white">
                  <h3>Muhammad Shalrizky</h3>
                  <h4>sahel@gmail.com</h4>
                </Card.Title>
                <div className="d-grid gap-2">
                  <Button variant="primary" size="md">
                    Edit Profile
                  </Button>
                  <Button variant="danger" size="md">
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
      </ImageLoader>
    </Container>
  );
}

export default Profile;
