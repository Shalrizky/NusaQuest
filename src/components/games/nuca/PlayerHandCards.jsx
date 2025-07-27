import React, { useState, memo, useCallback, useMemo } from "react";
import { Card } from "react-bootstrap";
import "../../../style/components/games/nuca/PlayerHandCards.css";

// Konstanta
const CARD_THROW_DELAY = 500; 
const DISABLED_CLASS = "disabled-throwing";
const THROWING_CLASS = "throwing";

/**
 * @function PlayerCardItem
 * @description Komponen individual yang mewakili satu kartu di tangan pemain.
 * Komponen ini bertanggung jawab untuk menampilkan teks pertanyaan kartu,
 * mengelola animasi pelemparan, dan menangani klik kartu.
 * @param {Object} props - Properti yang diteruskan ke komponen.
 * @param {Object} props.card - Objek data kartu, termasuk `id` dan `question_text`.
 * @param {number} props.index - Indeks kartu dalam tumpukan (digunakan untuk posisi visual).
 * @param {number} props.totalCardsInStack - Jumlah total kartu di tangan pemain.
 * @param {function(Object, number): void} props.onCardClickedFromP1 - Fungsi callback yang dipanggil saat kartu diklik.
 * Parameter adalah objek kartu dan indeks kartu.
 * @param {boolean} props.isThrowingEnabled - Menunjukkan apakah pelemparan kartu diizinkan saat ini.
 * @returns {JSX.Element} Elemen JSX `Card` yang mewakili satu kartu pemain.
 */
const PlayerCardItem = memo(
  ({
    card,
    index,
    totalCardsInStack,
    onCardClickedFromP1,
    isThrowingEnabled,
  }) => {
    const [isAnimatingCardOut, setIsAnimatingCardOut] = useState(false);

    /**
     * @constant cardStyles
     * @description Menggunakan `useMemo` untuk menghasilkan gaya CSS inline untuk penempatan kartu.
     * Gaya ini menggunakan variabel CSS `--index` dan `--total-cards` untuk tumpukan visual.
     * @returns {Object} Objek gaya CSS.
     */
    const cardStyles = useMemo(
      () => ({
        "--index": index,
        "--total-cards": totalCardsInStack,
      }),
      [index, totalCardsInStack]
    );

    /**
     * @constant cardClasses
     * @description Menggunakan `useMemo` untuk menghasilkan kelas CSS dinamis.
     * Kelas `throwing` ditambahkan saat kartu sedang dianimasikan keluar.
     * Kelas `disabled-throwing` ditambahkan jika pelemparan kartu tidak diizinkan.
     * @returns {string} String kelas CSS yang digabungkan.
     */
    const cardClasses = useMemo(() => {
      const classes = [];
      if (isAnimatingCardOut) classes.push(THROWING_CLASS);
      if (!isThrowingEnabled) classes.push(DISABLED_CLASS);
      return classes.join(" ");
    }, [isAnimatingCardOut, isThrowingEnabled]);

    /**
     * @function handleCardClick
     * @description Fungsi penanganan klik untuk kartu.
     * Jika pelemparan tidak diizinkan atau kartu sudah dalam animasi, klik akan diabaikan.
     * Memicu animasi keluar kartu dan memanggil `onCardClickedFromP1` setelah penundaan.
     * @returns {void}
     */
    const handleCardClick = useCallback(() => {
      if (!isThrowingEnabled || isAnimatingCardOut) {
        console.log("Melempar kartu dinonaktifkan saat ini.");
        return;
      }
      setIsAnimatingCardOut(true);
      setTimeout(() => {
        onCardClickedFromP1(card, index);
        setIsAnimatingCardOut(false);
      }, CARD_THROW_DELAY);
    }, [
      isThrowingEnabled,
      isAnimatingCardOut,
      onCardClickedFromP1,
      card,
      index,
    ]);

    return (
      <Card
        style={cardStyles}
        onClick={handleCardClick}
        className={cardClasses}
      >
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Card.Text>{card.question_text}</Card.Text>
        </Card.Body>
      </Card>
    );
  }
);

/**
 * @function PlayerHandCards
 * @description Komponen utama yang menampilkan tumpukan kartu di tangan pemain lokal.
 * Ini merender kumpulan `PlayerCardItem` dan mengelola gaya tumpukan kartu secara keseluruhan.
 * @param {Object} props - Properti yang diteruskan ke komponen.
 * @param {Array<Object>} props.cards - Array objek kartu yang dimiliki pemain.
 * @param {function(Object, number): void} props.onCardClick - Fungsi callback yang dipicu ketika salah satu kartu di tangan diklik.
 * @param {boolean} props.isThrowingEnabled - Menunjukkan apakah pemain diizinkan untuk melempar kartu saat ini.
 * @returns {JSX.Element} Elemen JSX yang mewakili tangan kartu pemain.
 */
const PlayerHandCards = memo(({ cards, onCardClick, isThrowingEnabled }) => {
  const totalCards = cards.length;

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
   * @constant cardList
   * @description Menggunakan `useMemo` untuk merender daftar `PlayerCardItem` dari array `cards`.
   * Ini membantu mencegah re-render `PlayerCardItem` yang tidak perlu jika properti lain di `PlayerHandCards` berubah,
   * tetapi daftar kartu itu sendiri tidak berubah.
   * @returns {Array<JSX.Element>} Array elemen `PlayerCardItem`.
   */
  const cardList = useMemo(
    () =>
      cards.map((card, index) => (
        <PlayerCardItem
          key={card.id} 
          card={card}
          index={index}
          totalCardsInStack={totalCards}
          onCardClickedFromP1={onCardClick}
          isThrowingEnabled={isThrowingEnabled}
        />
      )),
    [cards, totalCards, onCardClick, isThrowingEnabled] 
  );

  return (
    <div
      className="card-stack position-relative d-flex text-center justify-content-center align-items-center"
      style={containerStyles}
    >
      {cardList}
    </div>
  );
});

PlayerHandCards.displayName = "PlayerHandCards"; 

/**
 * @exports PlayerHandCards
 * @description Komponen `PlayerHandCards` diekspor sebagai memoized component
 * untuk mengoptimalkan kinerja dengan mencegah re-render yang tidak perlu
 * jika propertinya tidak berubah secara dangkal (shallowly).
 */
export default React.memo(PlayerHandCards);