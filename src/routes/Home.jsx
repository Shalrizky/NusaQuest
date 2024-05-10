import { useState, useEffect } from 'react';
import Init from '../firebase-init';
import { getDatabase, ref, onValue } from 'firebase/database';
import '../style/Home.css';
import { Container, Row, Col} from "react-bootstrap";
import Header from '../components/Header'

function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
   
    const db = getDatabase(Init);
    const dataRef = ref(db, 'example');

    // Membaca data dari Firebase Realtime Database
    onValue(dataRef, (snapshot) => {
      const firebaseData = snapshot.val();
      setData(firebaseData);
      console.log(firebaseData)
    });
  }, []);

  return (
    <Container fluid id='home-container'>
      <Header />
      <h1>NusaQuest</h1>
      {data && (
        <div>
          <p>Nama: {data.nama}</p>
          <p>Tinggal: {data.tinggal}</p>
          <p>Umur: {data.umur}</p>
        </div>
      )}
    </Container>
  );
}

export default Home;
