import React, { useEffect, useState } from 'react';
import { database, ref } from '../config/firebaseConfig';
import { onValue } from 'firebase/database';

const InformationDestination = () => {
  const [destinations, setDestinations] = useState([]);
  const [topics, setTopics] = useState({});

  useEffect(() => {
    const destinationsRef = ref(database, 'destination');
    const topicsRef = ref(database, 'topic');

    // Fetch destinations data
    onValue(destinationsRef, (snapshot) => {
      const data = snapshot.val();
      setDestinations(data ? Object.values(data) : []);
    });

    // Fetch topics data
    onValue(topicsRef, (snapshot) => {
      const data = snapshot.val();
      setTopics(data || {});
    });
  }, []);

  // Helper function to group destinations by topic_id
  const groupByTopic = (destinations) => {
    return destinations.reduce((grouped, destination) => {
      const { topic_id } = destination;
      if (!grouped[topic_id]) {
        grouped[topic_id] = [];
      }
      grouped[topic_id].push(destination);
      return grouped;
    }, {});
  };

  const groupedDestinations = groupByTopic(destinations);

  return (
    <div>
      <h1>Informasi Seputar Pariwisata</h1>
      {Object.keys(groupedDestinations).map((topicId) => (
        <div key={topicId}>
          <h2>{topics[topicId]?.name || topicId}</h2>
          {groupedDestinations[topicId].map((destination, index) => (
            <div key={index}>
              <h3>{destination.name}</h3>
              <p>{destination.desc}</p>
              {destination.img ? (
                <img src={destination.img} alt={destination.name} />
              ) : (
                <p>Gambar tidak tersedia</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default InformationDestination;
