import React, { useState, useEffect } from 'react';
import './Home.css';
import Init from '../firebase-init';
import { getDatabase, ref, onValue } from 'firebase/database';

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
    <div className="container-home">
      <h1>NusaQuest</h1>
      {data && (
        <div>
          <p>Nama: {data.nama}</p>
          <p>Tinggal: {data.tinggal}</p>
          <p>Umur: {data.umur}</p>
        </div>
      )}
    </div>
  );
}

export default Home;
