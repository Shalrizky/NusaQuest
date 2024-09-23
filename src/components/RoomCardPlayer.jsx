import { Card, Row, Col } from "react-bootstrap";
import Image from "../assets/common/image-player-1.png";
import Image2 from "../assets/common/image-player-2.png";
import Image3 from "../assets/common/image-player-3.png";
import badge1 from "../assets/common/badge.png";
import badge2 from "../assets/common/badge2.png";
import badge3 from "../assets/common/badge3.png";
import vector from "../assets/common/Vector.png"
import "../style/components/RoomCardPlayer.css";

const CustomCard = () => {
  return (
    <Row className="card-player-container d-flex justify-content-center align-items-center gap-5">

      <Col md={2}>
        <div className="card-wrapper">
          <Card className="card-player">
            <Card.Img variant="top" src={Image} className="img-card-player" />
            <Card.Body>
              <Card.Title className="title">Anak Bego (AB)</Card.Title>
              {/* <Card.Text className="text">
                <p>Master Kuliner</p>
              </Card.Text> */}

              <div className="card-image-container d-flex align-items-center">
                <Card.Img src={badge1} alt="Player" className="badge-image" />
                <span>Master Kuliner</span>
              </div>

              {/*<div className="mask-container d-flex align-items-center" style={{ marginTop: "10px" }}>
                <Card.Img src={mask} alt="Mask" className="mask-image" />
                <span>70%</span>
              </div> */}

            </Card.Body>
          </Card>
        </div> {/* akhir dari card-wrapper  */}
      </Col>

      <Col md={2}>
        <div className="card-wrapper2">
          <Card className="card-player">
            <Card.Img variant="top" src={Image2} className="img-card-player" />
            <Card.Body>
              <Card.Title className="title">Reyki Ganteng</Card.Title>
              <div className="card-image-container d-flex align-items-center">
                <Card.Img src={badge2} alt="Player" className="badge-image" />
                <span>Amatir Kuliner</span>
              </div>

              {/*<div className="mask-container d-flex align-items-center" style={{ marginTop: "10px" }}>
                <Card.Img src={mask} alt="Mask" className="mask-image" />
                <span>70%</span>
              </div> */}

            </Card.Body>
          </Card>
        </div> {/* akhir dari card-wrapper  */}
      </Col>

      <Col md={2}>
        <div className="card-wrapper3">
          <Card className="card-player">
            <Card.Img variant="top" src={Image3} className="img-card-player" />
            <Card.Body>
              <Card.Title className="title">King Sahel</Card.Title>
              <div className="card-image-container d-flex align-items-center">
                <Card.Img src={badge3} alt="Player" className="badge-image" />
                <span>Beginner kuliner</span>
              </div>

              {/*<div className="mask-container d-flex align-items-center" style={{ marginTop: "10px" }}>
                <Card.Img src={mask} alt="Mask" className="mask-image" />
                <span>70%</span>
              </div> */}

            </Card.Body>
          </Card>
        </div> {/* akhir dari card-wrapper  */}
      </Col>

      <Col md={2}>
        <Card className="bot">
          <Card.Img variant="top" src={vector} className="vector-player" />
          <Card.Body>
            <Card.Text className="text-4">
              <p>Menunggu Pemain Lain Untuk Masuk</p>
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

    </Row>
  );
};

export default CustomCard;
