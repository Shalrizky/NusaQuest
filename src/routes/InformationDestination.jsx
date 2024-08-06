import { useEffect, useState } from "react";
import { Container, Row, Col, Tabs, Tab } from "react-bootstrap";
import { database, ref, onValue } from "../config/firebaseConfig";
import "../style/routes/InformationDestination.css";
import Header from "../components/common/Header";
import ScrollableSection from "../components/ScrollableSection";

const InformationDestination = () => {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const destinationsRef = ref(database, "destination");

    onValue(destinationsRef, (snapshot) => {
      const data = snapshot.val();
      const destinations = data ? Object.values(data) : [];

      setDestinations(destinations);
    });
  }, []);

  const groupByTopic = (destinations) => {
    return destinations.reduce((grouped, destination) => {
      const { topic } = destination;
      if (!grouped[topic]) {
        grouped[topic] = [];
      }
      grouped[topic].push(destination);
      return grouped;
    }, {});
  };

  const groupedDestinations = groupByTopic(destinations);

  const shortenDescription = (desc, maxLength = 15) => {
    if (!desc) return "";
    return desc.split(" ").slice(0, maxLength).join(" ") + "...";
  };

  const filterDestinations = (destinations, category) => {
    return destinations.filter(
      (destination) => destination.kategori === category
    );
  };

  return (
    <Container fluid id="information-container">
      <Row className="information-content">
        <Col md={12}>
          <Header
            layout="information"
            showTextHeader="INFORMATION"
            showLogoIcon={false}
            showBackIcon={true}
          />
        </Col>
        <Col md={12}>
          <Tabs
            justify
            defaultActiveKey="pariwisata_darat"
            variant="pills"
            id="destination-tabs"
            className="gap-4"
          >
            <Tab
              eventKey="pariwisata_darat"
              title="PARIWISATA DARAT"
              tabClassName="custom-tab"
            >
              <h3>Most Popular</h3>
              <ScrollableSection
                topicId="pariwisata_darat"
                category="popular"
                destinations={filterDestinations(
                  groupedDestinations["pariwisata_darat"] || [],
                  "popular"
                )}
                shortenDescription={shortenDescription}
              />
              <h3>Most Recommended</h3>
              <ScrollableSection
                topicId="pariwisata_darat"
                category="recomended"
                destinations={filterDestinations(
                  groupedDestinations["pariwisata_darat"] || [],
                  "recomended"
                )}
                shortenDescription={shortenDescription}
              />
            </Tab>
            <Tab
              eventKey="permainan_daerah"
              title="PERMAINAN DAERAH"
              tabClassName="custom-tab"
            >
              <ScrollableSection
                topicId="permainan_daerah"
                category="recomended"
                destinations={filterDestinations(
                  groupedDestinations["permainan_daerah"] || [],
                  "recomended"
                )}
                shortenDescription={shortenDescription}
              />
            </Tab>
            <Tab
              eventKey="daerah_jawa_barat"
              title="DAERAH JAWA BARAT"
              tabClassName="custom-tab"
            >
              <ScrollableSection
                topicId="daerah_jawa_barat"
                category="recomended"
                destinations={filterDestinations(
                  groupedDestinations["daerah_jawa_barat"] || [],
                  "recomended"
                )}
                shortenDescription={shortenDescription}
              />
            </Tab>
            <Tab
              eventKey="kuliner_jawa_barat"
              title="KULINER JAWA BARAT"
              tabClassName="custom-tab"
            >
              <ScrollableSection
                topicId="kuliner_jawa_barat"
                category="recomended"
                destinations={filterDestinations(
                  groupedDestinations["kuliner_jawa_barat"] || [],
                  "recomended"
                )}
                shortenDescription={shortenDescription}
              />
            </Tab>
            <Tab
              eventKey="pariwisata_bahari"
              title="PARIWISATA BAHARI"
              tabClassName="custom-tab"
            >
              <ScrollableSection
                topicId="pariwisata_bahari"
                category="recomended"
                destinations={filterDestinations(
                  groupedDestinations["pariwisata_bahari"] || [],
                  "recomended"
                )}
                shortenDescription={shortenDescription}
              />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default InformationDestination;
