import React, { memo } from "react";
import { Card } from "react-bootstrap";
import "../../../style/components/games/nuca/ThrowingCard.css";

/**
 * @function ThrowingCard
 * @description Komponen yang menampilkan kartu yang sedang dilempar atau telah ditempatkan di area tengah permainan.
 * Komponen ini hanya merender kartu jika ada data kartu yang valid.
 * Komponen ini di-memoized untuk mengoptimalkan kinerja.
 * @param {Object} props - Properti yang diteruskan ke komponen.
 * @param {Object|null} props.cardData - Objek data kartu yang akan ditampilkan, termasuk `question_text`.
 * Akan bernilai `null` jika tidak ada kartu yang ditampilkan.
 * @returns {JSX.Element|null} Elemen JSX `Card` yang mewakili kartu yang dilempar, atau `null` jika `cardData` tidak ada.
 */
const ThrowingCard = memo(({ cardData }) => {
  if (!cardData) {
    return null;
  }

  return (
    <Card className="sent-card">
      <Card.Body className="d-flex justify-content-center align-items-center">
        <Card.Text>{cardData.question_text}</Card.Text>
      </Card.Body>
    </Card>
  );
});

/**
 * @exports ThrowingCard
 * @description Komponen `ThrowingCard` diekspor sebagai memoized component
 * untuk mengoptimalkan kinerja dengan mencegah re-render yang tidak perlu
 * jika propertinya tidak berubah secara dangkal (shallowly).
 */
export default ThrowingCard;
