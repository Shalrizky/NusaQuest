// Mengimpor dependensi
import React, { useState, useEffect, useRef } from 'react'; // Mengimpor React dan hooks untuk state, efek samping, dan referensi
import { Col, Container, Image, Row } from 'react-bootstrap'; // Mengimpor komponen Bootstrap untuk tata letak
import '../style/routes/GameplayCard.css'; // Mengimpor CSS untuk styling khusus
import DeckPlayer from '../components/games/DeckPlayer'; // Komponen Deck untuk kartu pemain
import BottomDeckCard from '../components/games/BottomDeckCard'; // Komponen kartu deck bawah untuk interaksi gameplay
import HeaderNuca from '../components/games/HeaderGame'; // Komponen header permainan
import PertanyaanNuca from '../components/games/PertanyaanNuca'; // Komponen untuk menampilkan pertanyaan
import backgroundImage from '../assets/common/background.png'; // Gambar latar belakang untuk game
import playerProfile from '../assets/common/imageOne.png'; // Gambar profil pemain
import shuffleIcon from '../assets/common/shuffle.png'; // Ikon untuk animasi acak
import Potion from "../components/games/potion"; // Komponen potion
import checkIcon from '../assets/common/checklist.png'; // Ikon untuk jawaban benar
import crossIcon from '../assets/common/cross.png'; // Ikon untuk jawaban salah

// Komponen fungsional utama untuk GameplayCard
function GameplayCard() {
  // Mendefinisikan variabel state untuk mengelola perilaku komponen
  const [isShuffling, setIsShuffling] = useState(false); // Mengontrol status animasi acak
  const [showPopup, setShowPopup] = useState(false); // Menentukan apakah popup pertanyaan ditampilkan
  const [isExitingPopup, setIsExitingPopup] = useState(false); // Mengontrol animasi keluar dari popup
  const [cards, setCards] = useState([ // State untuk kartu deck
    { title: "Makanan", text: "Sayur Asem adalah?" },
    { title: "Minuman", text: "Es Teh adalah?" },
    { title: "Buah", text: "Apel adalah?" },
    { title: "Sayuran", text: "Bayam adalah?" },
  ]);
  const [activeCard, setActiveCard] = useState(null); // Menyimpan kartu yang sedang dimainkan
  const [leftDeckCount, setLeftDeckCount] = useState(4); // Jumlah kartu di deck kiri
  const [rightDeckCount, setRightDeckCount] = useState(4); // Jumlah kartu di deck kanan
  const [isLoading, setIsLoading] = useState(false); // Status loading untuk memproses jawaban
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null); // Menyimpan apakah jawaban benar atau tidak
  const [showPotion, setShowPotion] = useState(false); // Mengontrol visibilitas potion
  const [isPotionActive, setIsPotionActive] = useState(false); // Menunjukkan apakah potion sedang digunakan
  const [topDeckLoading, setTopDeckLoading] = useState(false); // Status loading untuk aksi deck atas
  const [topDeckAnswer, setTopDeckAnswer] = useState(null); // Menyimpan hasil aksi deck atas (benar/salah)
  const [currentPlayer, setCurrentPlayer] = useState(1); // Menyimpan status pemain yang sedang aktif
  const timerRef = useRef(null); // Referensi ke timer untuk mengelola penundaan

  // Efek untuk secara otomatis menampilkan popup pertanyaan setelah 2 detik jika pemain 2 yang aktif
  useEffect(() => {
    if (currentPlayer === 2) {
      const timer = setTimeout(() => setShowPopup(true), 2000);
      return () => clearTimeout(timer); // Membersihkan timer saat komponen di-unmount
    }
  }, [currentPlayer]);

  // Efek untuk mengubah visibilitas potion berdasarkan visibilitas popup
  useEffect(() => {
    if (showPopup) {
      setShowPotion(true);
    } else {
      setShowPotion(false);
    }
  }, [showPopup]);

  // Fungsi untuk menangani pengacakan kartu, dengan penundaan
  const handleShuffle = () => {
    setIsShuffling(true); // Memulai animasi acak
    setTimeout(() => {
      setIsShuffling(false); // Menghentikan animasi acak
      handleTopDeckAction(); // Memicu aksi deck atas setelah mengacak
    }, 2000);
  };

  // Fungsi untuk menangani aksi pada deck atas (hasil benar/salah secara acak)
  const handleTopDeckAction = () => {
    setTopDeckLoading(true); // Memulai animasi loading untuk deck atas
    setTimeout(() => {
      setTopDeckLoading(false); // Menghentikan animasi loading
      const isCorrect = Math.random() < 0.5; // Menentukan apakah aksi benar secara acak
      setTopDeckAnswer(isCorrect);
      setTimeout(() => {
        setTopDeckAnswer(null); // Mereset jawaban setelah 2 detik
        // Perpindahan giliran pemain setelah top deck action selesai
        setCurrentPlayer((prevPlayer) => (prevPlayer === 4 ? 1 : prevPlayer + 1));
      }, 2000);
    }, 2000);
  };

  // Fungsi untuk menangani klik pada kartu dari deck bawah
  const handleBottomCardClick = (card) => {
    setActiveCard(card); // Mengatur kartu yang dipilih sebagai aktif
    setCards((prevCards) => prevCards.filter((c) => c !== card)); // Menghapus kartu dari deck
    setIsLoading(true); // Mengatur status loading menjadi true
    timerRef.current = setTimeout(() => {
      handleRightDeckAnswer(); // Memanggil jawaban deck kanan setelah 10 detik
    }, 10000);
  };

  // Fungsi untuk menangani jawaban deck kanan (hasil benar/salah secara acak)
  const handleRightDeckAnswer = () => {
    const isCorrect = Math.random() < 0.5; // Menentukan apakah jawaban benar secara acak
    setIsCorrectAnswer(isCorrect);
    if (!isCorrect) {
      setRightDeckCount((prevCount) => prevCount + 1); // Menambah jumlah kartu di deck kanan jika salah
    }
    setActiveCard(null); // Menghapus kartu aktif
    clearTimeout(timerRef.current); // Menghapus timer yang ada
    setIsLoading(false); // Mereset status loading
    setTimeout(() => {
      setIsCorrectAnswer(null); // Mereset status jawaban setelah 2 detik
      handleShuffle(); // Memicu aksi pengacakan
    }, 2000);
  };

  // Fungsi untuk menangani pemilihan jawaban dari popup
  const handleAnswerSelect = (isCorrect) => {
    if (!isCorrect) {
      setRightDeckCount((prevCount) => prevCount + 1); // Menambah jumlah kartu di deck kanan jika salah
    }
    clearTimeout(timerRef.current); // Menghapus timer
    setActiveCard(null); // Menghapus kartu aktif
    setIsExitingPopup(true); // Mengatur status keluar dari popup
    setTimeout(() => {
      setShowPopup(false); // Menyembunyikan popup setelah animasi keluar
      setIsExitingPopup(false);
      handleShuffle(); // Memicu aksi pengacakan
    }, 2000);
  };

  // Mengembalikan JSX untuk merender UI komponen
  return (
    <div className="nuca-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <HeaderNuca layout="home" /> {/* Header game */}

      <Container fluid className="h-100 text-center mt-5">
        <Row className="h-75 d-flex align-items-center justify-content-center position-relative">
          {/* Deck Atas Player 3 */}
          <Col xs={12} className="d-flex justify-content-center align-items-center position-absolute" style={{ top: '-100px', zIndex: '15', transform: 'scale(0.8)' }}>
            <div style={{ position: 'relative' }}>
              <DeckPlayer cardCount={5} /> {/* Komponen deck pemain */}
              {topDeckLoading && ( /* Spinner loading untuk deck atas */
                <div className="loading-spinner" style={{ position: 'absolute', top: '50%', right: '-40px', transform: 'translateY(-50%)' }}>
                  <div className="spinner"></div>
                </div>
              )}
              {topDeckAnswer !== null && ( /* Menampilkan ikon benar/salah berdasarkan aksi deck atas */
                <div style={{ position: 'absolute', top: '50%', right: '-40px', transform: 'translateY(-50%)' }}>
                  <img 
                    src={topDeckAnswer ? checkIcon : crossIcon} 
                    alt={topDeckAnswer ? "Check Icon" : "Cross Icon"} 
                    style={{ width: '40px', height: '40px' }} 
                  />
                </div>
              )}
            </div>
          </Col>

          {/* Deck Kiri Player 4 */}
          <Col xs={4} className="d-flex justify-content-center align-items-center">
            <div className="deck-wrapper-left mt-5" style={{ transform: 'rotate(90deg) scale(0.8)', marginBottom: '-50px' }}>
              <DeckPlayer cardCount={leftDeckCount} /> {/* Deck pemain di kiri */}
            </div>
          </Col>

          {/* Deck Tengah */}
          <Col xs={4} className="d-flex justify-content-center align-items-center position-relative">
            <div className="deck-wrapper-middle" style={{ transform: 'scale(0.6)', position: 'relative' }}>
              <DeckPlayer cardCount={5} /> {/* Deck utama di tengah */}
              <img
                src={shuffleIcon}
                alt="Shuffle Icon"
                className={`shuffle-icon ${isShuffling ? 'rotating' : ''}`} // Menerapkan kelas rotating jika sedang mengacak
                style={{
                  width: '400px',
                  height: 'auto',
                  position: 'absolute',
                  bottom: '-100px',
                  left: '-170px',
                  zIndex: '10',
                }}
              />
              {activeCard && ( /* Menampilkan kartu aktif saat dipilih */
                <div className="moving-card animate">
                  <h3>{activeCard.title}</h3>
                  <p>{activeCard.text}</p>
                </div>
              )}
            </div>
          </Col>

          {/* Deck Kanan Player 2 */}
          <Col xs={4} className="d-flex justify-content-center align-items-center position-relative">
            <div className="deck-wrapper-right" style={{ transform: 'rotate(270deg) scale(0.8)' }}>
              <DeckPlayer cardCount={rightDeckCount} /> {/* Deck pemain di kanan */}
            </div>
            {isLoading && ( /* Spinner loading saat memproses jawaban */
              <div className="loading-spinner" style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)' }}>
                <div className="spinner"></div>
              </div>
            )}
            {isCorrectAnswer !== null && ( /* Menampilkan ikon benar/salah berdasarkan aksi deck kanan */
              <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', zIndex: '20' }}>
                <img 
                  src={isCorrectAnswer ? checkIcon : crossIcon} 
                  alt={isCorrectAnswer ? "Check Icon" : "Cross Icon"} 
                  style={{ width: '60px', height: '60px' }} 
                />
              </div>
            )}
          </Col>
        </Row>

        {/* Deck Bawah Player 1 */}
        <Row className="align-items-center text-center">
          <Col xs={12} className="d-flex justify-content-center">
            <div className="stackable-cards">
              <BottomDeckCard cards={cards} onCardClick={handleBottomCardClick} /> {/* Komponen deck bawah */}
              <Image
                src={playerProfile}
                roundedCircle
                className="player-image mt-3 img-fluid"
                style={{ width: "100px", height: "100px", marginLeft: "20px" }}
              />
            </div>
          </Col>
        </Row>
      </Container>

      {/* Komponen potion jika terlihat */}
      {showPotion && (
        <div style={{ position: 'absolute', bottom: '-50px', right: '30px', zIndex: '2300', pointerEvents: 'auto' }}>
          <Potion />
        </div>
      )}

      {/* Komponen potion jika aktif */}
      {isPotionActive && <Potion />}

      {/* Komponen popup pertanyaan */}
      {showPopup && (
        <div style={{ position: 'relative', zIndex: '2200' }}>
          <PertanyaanNuca
            onAnswerSelect={handleAnswerSelect}
            isExiting={isExitingPopup}
            isVisible={showPopup}
          />
        </div>
      )}
    </div>
  );
}

// Mengekspor komponen
export default GameplayCard;
