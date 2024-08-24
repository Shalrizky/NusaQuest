import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { fetchDestinationById } from '../services/destinationDataServices'; 

const DestinationDetail = () => {
  const { id } = useParams(); // Mengambil id dari URL
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    // Gunakan layanan untuk mengambil data
    fetchDestinationById(id, (data) => {
      setDestination(data);
    });
  }, [id]);

  if (!destination) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Row>
        <Col>
          <Card>
            <img src={destination.img} alt={destination.name} />
            <Card.Body>
              <Card.Title>{destination.name}</Card.Title>
              <Card.Text>
                {destination.description}
              </Card.Text>
              
              {/* Hanya tampilkan alamat dan harga tiket jika topik adalah "pariwisata_darat" */}
              {destination.topic === "pariwisata_darat" && (
                <>
                  <h5>Alamat</h5>
                  <p>{destination.address}</p>

                  <h5>Harga Tiket Masuk</h5>
                  <ul>
                    {Object.keys(destination.ticket_price || {}).map((key) => (
                      <li key={key}>{key}: {destination.ticket_price[key]}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* Tampilkan aktivitas jika ada */}
              {destination.activities && (
                <>
                  <h5>Apa Saja yang Bisa Dilakukan</h5>
                  <ul>
                    {Object.keys(destination.activities).map((key) => (
                      <li key={key}><strong>{key}:</strong> {destination.activities[key]}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* Hanya tampilkan fakta unik jika topik adalah "daerah_jawa_barat" */}
              {destination.topic === "daerah_jawa_barat" && destination.fact && (
                <>
                  <h5>Fakta Unik</h5>
                  <ul>
                    {Object.keys(destination.fact).map((key) => (
                      <li key={key}><strong>{key}:</strong> {destination.fact[key]}</li>
                    ))}
                  </ul>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DestinationDetail;
