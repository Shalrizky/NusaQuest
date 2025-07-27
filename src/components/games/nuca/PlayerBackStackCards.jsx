import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { Image } from "react-bootstrap";
import BackCard from "../../../assets/games/nuca/backCard.png";
import ShuffleImage from "../../../assets/games/nuca/shuffle.png";
import "../../../style/components/games/nuca/PlayerBackStackCards.css";

// Konstanta
const ANIMATION_CLASS = "rotate-once"; 
const ANIMATION_EVENT = "animationend";

/**
 * @function PlayerBackStackCards
 * @description Komponen yang menampilkan tumpukan kartu belakang (back stack) untuk pemain lain
 * atau tumpukan kartu dek tengah. Komponen ini juga dapat menampilkan indikator pemain tidak tersedia
 * atau animasi pengocokan.
 * @param {Object} props - Properti yang diteruskan ke komponen.
 * @param {number} props.totalCards - Jumlah total kartu yang akan ditampilkan dalam tumpukan.
 * @param {string} props.position - Posisi tumpukan kartu di layout game (misalnya "top", "left", "right", "middle").
 * @param {boolean} [props.showShuffle=false] - Jika `true`, ikon pengocokan akan ditampilkan.
 * @param {boolean} [props.showNotAvail=false] - Jika `true`, gambar "pemain tidak tersedia" akan ditampilkan menggantikan kartu.
 * @param {string} props.notAvailImage - URL gambar yang akan ditampilkan jika `showNotAvail` adalah `true`.
 * @param {boolean} [props.triggerShuffleAnimation=false] - Memicu animasi pengocokan jika `true`. Akan direset oleh komponen itu sendiri.
 * @returns {JSX.Element} Elemen JSX yang mewakili tumpukan kartu belakang atau indikator pemain tidak tersedia.
 */
function PlayerBackStackCards({
  totalCards,
  position,
  showShuffle = false,
  showNotAvail = false,
  notAvailImage,
  triggerShuffleAnimation = false,
}) {
  const shuffleImageRef = useRef(null); 

  /**
   * @constant containerStyles
   * @description Menggunakan `useMemo` untuk menghasilkan gaya CSS inline untuk container tumpukan kartu.
   * Gaya ini menggunakan variabel CSS `--total-cards` untuk menyesuaikan tata letak berdasarkan jumlah kartu.
   * @returns {Object} Objek gaya CSS.
   */
  const containerStyles = useMemo(
    () => ({
      "--total-cards": totalCards,
    }),
    [totalCards]
  );

  /**
   * @function animationEndHandler
   * @description Fungsi callback yang dipicu ketika animasi pengocokan selesai.
   * Ini akan menghapus kelas animasi dari elemen gambar pengocokan
   * dan menghapus event listener untuk mencegah pemanggilan berulang.
   * @returns {void}
   */
  const animationEndHandler = useCallback(() => {
    if (shuffleImageRef.current) {
      shuffleImageRef.current.classList.remove(ANIMATION_CLASS); 
      shuffleImageRef.current.removeEventListener(
        ANIMATION_EVENT,
        animationEndHandler 
      );
    }
  }, []); 

  /**
   * @effect Animasi Pengocokan
   * @description Mengamati properti `triggerShuffleAnimation`.
   * Jika `triggerShuffleAnimation` menjadi `true`, ini akan menambahkan kelas animasi
   * ke gambar pengocokan dan mendaftarkan event listener untuk membersihkan kelas setelah animasi selesai.
   */
  useEffect(() => {
    if (triggerShuffleAnimation && shuffleImageRef.current) {
      console.log(
        "PlayerBackStackCards: triggerShuffleAnimation changed to",
        triggerShuffleAnimation
      );
      shuffleImageRef.current.classList.add(ANIMATION_CLASS);
      shuffleImageRef.current.addEventListener(
        ANIMATION_EVENT,
        animationEndHandler
      );
    }
  }, [triggerShuffleAnimation, animationEndHandler]); 

  /**
   * @constant cardStack
   * @description Menggunakan `useMemo` untuk menghasilkan elemen-elemen kartu belakang atau gambar "pemain tidak tersedia".
   * Logika ini memutuskan apakah akan merender gambar `notAvailImage` atau tumpukan kartu belakang.
   * @returns {JSX.Element|Array<JSX.Element>} Elemen JSX untuk gambar "pemain tidak tersedia" atau array elemen kartu belakang.
   */
  const cardStack = useMemo(() => {
    if (showNotAvail) { 
      return (
        <div className={`not-avail-card-item ${position}`}>
          <Image
            src={notAvailImage}
            alt="Player Not Available"
            className="not-avail-player"
          />
        </div>
      );
    }
    return Array.from({ length: totalCards }, (_, index) => (
      <div
        key={`card-${index}`} // Kunci unik untuk setiap kartu
        className={`back-card-item ${position}`}
        style={{
          "--index": index,
          zIndex: totalCards - index,
        }}
      >
        <Image src={BackCard} alt={`Back Card ${index + 1}`} />
      </div>
    ));
  }, [totalCards, position, showNotAvail, notAvailImage]);

  /**
   * @constant shuffleElement
   * @description Menggunakan `useMemo` untuk merender elemen gambar pengocokan (`ShuffleImage`).
   * Elemen ini hanya ditampilkan jika `showShuffle` adalah `true`.
   * @returns {JSX.Element|null} Elemen JSX `Image` untuk pengocokan atau `null`.
   */
  const shuffleElement = useMemo(() => {
    if (!showShuffle) return null; 

    return (
      <div className="d-flex justify-content-center align-items-center">
        <Image
          ref={shuffleImageRef} 
          src={ShuffleImage}
          alt="Shuffle"
          className="shuffle-image"
        />
      </div>
    );
  }, [showShuffle]); 

  return (
    <div
      className="stack-container position-relative d-flex justify-content-center align-items-center"
      style={containerStyles}
    >
      {cardStack} 
      {shuffleElement}
    </div>
  );
}

/**
 * @exports PlayerBackStackCards
 * @description Komponen `PlayerBackStackCards` diekspor sebagai memoized component
 * untuk mengoptimalkan kinerja dengan mencegah re-render yang tidak perlu
 * jika propertinya tidak berubah secara dangkal (shallowly).
 */
export default React.memo(PlayerBackStackCards);