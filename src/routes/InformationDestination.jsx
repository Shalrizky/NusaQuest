import { useEffect, useState } from "react";
import { Container, Row, Col, Tabs, Tab, Spinner } from "react-bootstrap";
import "../style/routes/InformationDestination.css";
import Header from "../components/Header";
import CardInformation from "../components/CardInformation";
import {
  fetchDestinations,
  fetchTopics,
} from "../services/destinationDataServices";
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from "../utils/localStorageUtil"; 

const InformationDestination = () => { 
  const [destinations, setDestinations] = useState([]);
  const [topics, setTopics] = useState({});
  const [loadingTabs, setLoadingTabs] = useState({});
  const [activeTab, setActiveTab] = useState(
    getLocalStorageItem('lastActiveTab') || "daerah_jawa_barat" 
  );

  useEffect(() => {
    // Simpan tab terakhir saat user beralih tab
    window.onbeforeunload = () => {
      removeLocalStorageItem('lastActiveTab'); 
    };

    fetchTopics((fetchedTopics) => {
      setTopics(fetchedTopics);

      const initialLoadingTabs = Object.keys(fetchedTopics).reduce(
        (acc, key) => {
          acc[key] = true;
          return acc;
        },
        {}
      );

      setLoadingTabs(initialLoadingTabs);

      fetchDestinations((fetchedDestinations) => {
        setDestinations(fetchedDestinations);
        const updatedLoadingTabs = { ...initialLoadingTabs };
        Object.keys(fetchedTopics).forEach((topicKey) => {
          updatedLoadingTabs[topicKey] = false;
        });

        setLoadingTabs(updatedLoadingTabs);
      });
    });
  }, []);


  // Fungsi untuk mengelompokkan destinasi berdasarkan topik dan tipe
  const groupByTopicAndType = (destinations) => {
    const grouped = {};

    Object.entries(destinations).forEach(([key, destination]) => {
      const { topic, type } = destination;

      if (!grouped[topic]) {
        grouped[topic] = {};
      }

      if (!grouped[topic][type]) {
        grouped[topic][type] = [];
      }

      grouped[topic][type].push({ ...destination, id: key });
    });

    return grouped;
  };

  const groupedDestinations = groupByTopicAndType(destinations);

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    setLocalStorageItem('lastActiveTab', tabKey);
  };

  return (
    <Container fluid id="information-container">
      <Header
        showTextHeader="INFORMATION"
        showLogoIcon={false}
        showBackIcon={true}
      />
      <Row className="information-content my-3">
        <Col md={12} className="px-5">
          <Tabs
            justify
            activeKey={activeTab}
            onSelect={handleTabSelect}
            variant="pills"
            id="destination-tabs"
            className="gap-4 pb-2"
          >
            {Object.keys(topics).map((key) => (
              <Tab
                key={key}
                eventKey={key}
                title={topics[key].name}
                tabClassName="custom-tab"
              >
                {loadingTabs[key] ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "200px"}}
                  >
                    <Spinner animation="border" variant="light" />
                  </div>
                ) : Object.entries(groupedDestinations[key] || {}).length >
                  0 ? (
                  Object.keys(groupedDestinations[key]).map((typeKey) => (
                    <div
                      key={typeKey}
                      className="d-grid align-items-center justify-content-start my-4 pb-3"
                    >
                      <h3>{typeKey}</h3>
                      <CardInformation
                        type={typeKey}
                        destinations={groupedDestinations[key][typeKey] || []}
                      />
                    </div>
                  ))
                ) : (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "200px", color: "#fff", fontWeight: "bold" }}
                  >
                    <h4>Data Not Found 😪</h4>
                  </div>
                )}
              </Tab>
            ))}
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default InformationDestination;
