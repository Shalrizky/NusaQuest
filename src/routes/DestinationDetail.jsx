import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Spinner, Image } from "react-bootstrap";
import { fetchDestinationById } from "../services/destinationDataServices";
import Header from "../components/Header";
import NotFound from "../assets/common/not-found-img.png";
import "../style/routes/DetailDestination.css";

const DestinationDetail = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    fetchDestinationById(id, (data) => {
      setDestination(data);
    });
  }, [id]);

  // Fungsi untuk membagi deskripsi menjadi paragraf jika terdapat 4 titik
  const splitDescriptionIntoParagraphs = (description) => {
    const sentences = description.split(". ");
    let paragraph = [];
    let paragraphs = [];
    let periodCount = 0;

    sentences.forEach((sentence, index) => {
      periodCount += 1; // Menghitung jumlah titik
      paragraph.push(sentence);

      // Jika sudah ada 4 kalimat atau ini adalah kalimat terakhir, buat paragraf baru
      if (periodCount === 4 || index === sentences.length - 1) {
        paragraphs.push(
          paragraph.join(". ") + (index === sentences.length - 1 ? "" : ".")
        );
        paragraph = [];
        periodCount = 0;
      }
    });

    return paragraphs;
  };

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

  // Jika tidak ada deskripsi tampil halaman eror
  if (!destination.description) {
    return (
      <Container
        fluid
        id="detail-destination-container"
        className="d-flex flex-column"
      >
        <Header
          showTextHeader={destination.name}
          showBackIcon={true}
          showLogoIcon={false}
        />
        <Row className="d-flex justify-content-center align-items-center mt-5">
          <Col md={12} className="text-center text-white">
            <h1 className="fw-bold pb-2">😓OOPSY</h1>
            <h3>
              Konten Informasi Belum Tersedia Untuk Destinasi Ini, Coba Lagi
              Nanti.
            </h3>
          </Col>
        </Row>
        <Row className="d-flex justify-content-center align-items-center">
          <Col
            md={12}
            className="d-flex justify-content-center align-items-center"
          >
            <img src={NotFound} alt="not found" width={500} />
          </Col>
        </Row>
      </Container>
    );
  }

  const paragraphs = splitDescriptionIntoParagraphs(destination.description);

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
              {/* Render setiap paragraf */}
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Tampilkan aktivitas Hanya pada pariwisata_darat */}
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

            {/* Tampilkan rekomendasi kuliner hanya pada kuliner_jawa_barat */}
            {destination.recommendations && (
              <div className="destination-culinary-recommendations mb-4 px-4 pt-4 pb-2">
                <h4>Rekomendasi Tempat Kuliner</h4>
                <ol>
                  {destination.recommendations.map((recommendation, index) => (
                    <li key={index}>
                      <strong>{recommendation.restaurant_name}</strong> -{" "}
                      {recommendation.restaurant_address}
                      <p>{recommendation.restaurant_description}</p>
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

            {/* Tampilkan cara bermain jika ada */}
            {destination["Cara Bermain"] && (
              <div className="destination-play-instructions mb-4 px-4 pt-4 pb-2">
                <h4>Cara Bermain</h4>
                <p>{destination["Cara Bermain"]}</p>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DestinationDetail;
