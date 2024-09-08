import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Spinner, Image } from "react-bootstrap";
import { fetchDestinationById } from "../services/destinationDataServices";
import Header from "../components/Header";
import "../style/routes/DetailDestination.css";

const DestinationDetail = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    fetchDestinationById(id, (data) => {
      setDestination(data);
    });
  }, [id]);

  if (!destination) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "600px" }}
      >
        <Spinner animation="border" variant="dark" />
      </div>
    );
  }

  return (
    <Container fluid id="detail-destination-container">
      <Header
        showTextHeader={destination.name}
        showBackIcon={true}
        showLogoIcon={false}
      />
      <Row className="justify-content-center my-3">
        <Col md={11} lg={11}>
          <div className="destination-content d-flex flex-column justify-content-center align-items center">
            <div className="destination-image mb-4 d-flex justify-content-center">
              <Image
                className="img-content"
                src={destination.img}
                alt={destination.name}
              />
            </div>
            <div className="destination-details mb-4 px-4 pt-4 pb-2">
              <p>{destination.description}</p>
            </div>

            {/* Tampilkan aktivitas jika ada */}
            {destination.activities && (
              <div className="destination-activities mb-4 px-4 pt-4 pb-2">
                <h4 className="pb-2">Apa Saja yang Bisa Dilakukan</h4>
                <ol>
                  {Object.keys(destination.activities).map((key) => (
                    <li key={key}>
                      <strong>{key}:</strong> {destination.activities[key]}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Hanya tampilkan alamat dan harga tiket jika topik adalah "pariwisata_darat" */}
            {destination.topic === "pariwisata_darat" && (
              <div className="destination-ticket mb-4 px-4 pt-4 pb-2">
                <h4 className="pb-2">Alamat</h4>
                <p className="pb-2">{destination.address}</p>

                <h4 className="pb-2">Harga Tiket Masuk</h4>
                <ol>
                  {Object.keys(destination.ticket_price || {}).map((key) => (
                    <li key={key}>
                      <strong>{key}: </strong> {destination.ticket_price[key]}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Hanya tampilkan fakta unik jika topik adalah "daerah_jawa_barat" */}
            {destination.topic === "daerah_jawa_barat" && destination.fact && (
              <div className="destination-facts mb-4 px-4 pt-4 pb-2">
                <h4>Fakta Unik</h4>
                <ol>
                  {Object.keys(destination.fact).map((key) => (
                    <li key={key}>
                      <strong>{key}:</strong> {destination.fact[key]}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DestinationDetail;
