import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import victoryImage from "../../assets/games/victory.png";
import useAuth from "../../hooks/useAuth";
import { listenToAchievementUpdates } from "../../services/achievementDataServices";
import { getPotionData } from "../../services/itemsDataServices";
import "../../style/components/games/victoryOverlay.css";

function VictoryOverlay({ winner, onClose }) {
  const { user } = useAuth();
  const { topicID } = useParams();
  const [potionData, setPotionData] = useState(null);
  const [achievementData, setAchievementData] = useState(null);
  const [badge, setBadge] = useState(null);
  const [totalWins, setTotalWins] = useState(0);
  const [loading, setLoading] = useState(true); // Tambahkan loading state

  // Fetch potion data
  useEffect(() => {
    const fetchPotionData = async () => {
      if (!user?.uid) return;
      try {
        const data = await getPotionData(user.uid);
        setPotionData(data);
      } catch (error) {
        console.error("Failed to fetch potion data:", error);
      }
    };
    fetchPotionData();
  }, [user?.uid]);

  // Listen to real-time achievement updates
  useEffect(() => {
    if (!user?.uid || !topicID) return;

    // Gunakan listener real-time untuk memantau perubahan achievement
    const unsubscribe = listenToAchievementUpdates(user.uid, "game1", topicID, (data) => {
      setAchievementData(data);
      const wins = data.totalWins || 0;
      setTotalWins(wins);

      // Update badge berdasarkan jumlah kemenangan
      if (wins === 1 || wins === 3 || wins === 5) {
        setBadge(data.badge);
      } else {
        setBadge(null);
      }
      setLoading(false); // Set loading ke false setelah data diterima
    });

    return () => unsubscribe(); // Hentikan listener saat komponen di-unmount
  }, [user?.uid, topicID]);

  // Auto close after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (loading) return <p>Loading...</p>; // Tampilkan loading saat data belum siap

  return (
    <div className="victory-overlay" onClick={onClose}>
      <img src={victoryImage} alt="Victory Logo" className="victory-logo" />
      <h2>
        {winner} <span>Wins!</span>
      </h2>
      <p>Total Wins: {totalWins}</p> {/* Tampilkan totalWins */}
      <p>Selamat Kamu mendapatkan:</p>
      <div className="rewards mb-4" onClick={(e) => e.stopPropagation()}>

        {/* Tampilkan Achievement Trophy hanya jika mencapai tingkat yang baru */}
        {achievementData?.totalWins === 5 && (
          <div className="reward-item">
            <img
              src={achievementData.achievement_trophy}
              alt="Achievement Trophy"
              width={80}
            />
            <p>{achievementData.achievement_name}</p>
          </div>
        )}

        {/* Badge - Tampilkan jika mencapai level bronze, silver, atau gold */}
        {badge && (
          <div className="reward-item">
            <img
              src={badge.iconURL}
              alt="Badge Icon"
              className="badge-item"
              width={80}
            />
            <p>{badge.badgeName}</p>
          </div>
        )}

        {/* Potion Reward - selalu tampil */}
        {potionData && (
          <div className="reward-item">
            <img
              src={potionData.item_img}
              alt="Potion"
              className="potion-img"
              width={70}
            />
            <p>+1 {potionData.item_name}</p>
          </div>
        )}
      </div>
      <p>Sentuh di mana saja untuk keluar /</p>
      <p className="auto-redirect-info">
        Anda akan diarahkan keluar dalam waktu 10 detik...
      </p>
    </div>
  );
}

export default VictoryOverlay;
