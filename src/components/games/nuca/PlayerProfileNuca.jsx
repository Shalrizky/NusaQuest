import { memo, useMemo, useState, useEffect } from "react";
import { Image } from "react-bootstrap";
import DefaultProfileImage from "../../../assets/common/icon-profile.svg";
import CheckIcon from "../../../assets/games/nuca/checklist.png";
import CrossIcon from "../../../assets/games/nuca/cross.png";
import "../../../style/components/games/nuca/PlayerProfileNuca.css";

// Konstanta
const DEFAULT_RADIUS = 29; 
const STROKE_WIDTH = 6; 
const TIME_THRESHOLDS = {
  HIGH: 55,   
  MEDIUM: 25, 
  LOW: 0,     
};
const STROKE_COLORS = {
  HIGH: "#06923E",      
  MEDIUM: "#FFC107",    
  LOW: "#B22222",       
  TRANSPARENT: "transparent",
};

/**
 * @function PlayerProfileNuca
 * @description Komponen yang menampilkan profil seorang pemain dalam game NusaCard.
 * Ini mencakup gambar profil, jumlah kartu, indikator giliran aktif dengan timer melingkar,
 * umpan balik jawaban (benar/salah), dan teks status dinamis.
 * Komponen ini di-memoized untuk mengoptimalkan kinerja.
 * @param {Object} props - Properti yang diteruskan ke komponen.
 * @param {Object} [props.userProfile={}] - Objek profil pengguna lama (sebelum `playerData` digunakan).
 * @param {string} props.position - Posisi relatif profil di layout game (misalnya "top-left", "bottom-right", "left", "right", "center").
 * @param {number} props.totalCards - Jumlah total kartu yang dimiliki pemain ini.
 * @param {number} [props.radius=DEFAULT_RADIUS] - Radius lingkaran profil.
 * @param {boolean} [props.isActive=false] - Status boolean apakah pemain ini aktif (gilirannya).
 * @param {number} [props.timeLeft=0] - Sisa waktu dalam detik untuk giliran pemain ini.
 * @param {number} [props.maxTime=0] - Waktu maksimum dalam detik untuk giliran pemain ini.
 * @param {string|null} [props.answerFeedback=null] - Umpan balik jawaban ("correct", "incorrect", atau `null`).
 * @param {string|null} [props.currentTurnPhase=null] - Fase giliran saat ini ("throwing" atau "answering").
 * @param {Object|null} [props.playerData=null] - Objek data lengkap pemain yang sebenarnya dari Firebase, termasuk `photoURL` atau `profileImageUrl`.
 * @param {boolean} [props.hideStatusText=false] - Jika `true`, teks status ("Memilih...", "Menjawab...") akan disembunyikan.
 * @returns {JSX.Element} Elemen JSX yang mewakili profil pemain.
 */
const PlayerProfileNuca = memo(
  ({
    userProfile = {},
    position,
    totalCards,
    radius = DEFAULT_RADIUS,
    isActive = false, 
    timeLeft = 0,
    maxTime = 0,
    answerFeedback = null,
    currentTurnPhase = null,
    playerData = null, 
    hideStatusText = false,
  }) => {

    /**
     * @constant profileImage
     * @description Menggunakan `useMemo` untuk menentukan URL gambar profil yang akan ditampilkan.
     * Prioritasnya: `playerData.photoURL`, lalu `playerData.profileImageUrl`,
     * lalu `userProfile.image`, dan terakhir `DefaultProfileImage`.
     * @returns {string} URL gambar profil.
     */
    const profileImage = useMemo(() => {
      if (playerData?.photoURL) {
        return playerData.photoURL;
      }
      if (playerData?.profileImageUrl) {
        return playerData.profileImageUrl;
      }
      return userProfile?.image || DefaultProfileImage;
    }, [userProfile?.image, playerData?.photoURL, playerData?.profileImageUrl]);

    const [dots, setDots] = useState(""); 

    /**
     * @constant baseStatusText
     * @description Menggunakan `useMemo` untuk menentukan teks status dasar ("Memilih" atau "Menjawab").
     * Teks ini hanya muncul jika pemain aktif dan `hideStatusText` adalah `false`.
     * @returns {string|null} Teks status dasar atau `null`.
     */
    const baseStatusText = useMemo(() => {
      if (!isActive) return null; 
      if (hideStatusText) return null; 
      return currentTurnPhase === "throwing" ? "Memilih" : "Menjawab";
    }, [isActive, currentTurnPhase, hideStatusText]);

    /**
     * @effect Animasi Titik Berjalan
     * @description Mengelola interval untuk menambahkan/menghapus titik-titik pada teks status
     * (`animatedStatusText`). Ini menciptakan efek animasi "berpikir" atau "memuat".
     * Interval dibersihkan saat `baseStatusText` berubah atau komponen di-unmount.
     */
    useEffect(() => {
      let intervalId;
      if (baseStatusText) { 
        setDots(""); 
        intervalId = setInterval(() => {
          setDots((prevDots) => {
            if (prevDots.length < 3) {
              return prevDots + ".";
            }
            return "";
          });
        }, 600); 
      }
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [baseStatusText]); 

    /**
     * @constant animatedStatusText
     * @description Menggunakan `useMemo` untuk menggabungkan `baseStatusText` dengan `dots`
     * untuk menghasilkan teks status yang dianimasikan.
     * @returns {string|null} Teks status yang dianimasikan atau `null`.
     */
    const animatedStatusText = useMemo(() => {
      return baseStatusText ? `${baseStatusText}${dots}` : null;
    }, [baseStatusText, dots]);

    /**
     * @constant feedbackIcon
     * @description Menggunakan `useMemo` untuk menentukan ikon umpan balik jawaban (checklist atau cross)
     * berdasarkan properti `answerFeedback`.
     * @returns {JSX.Element|null} Elemen JSX `Image` untuk ikon umpan balik atau `null`.
     */
    const feedbackIcon = useMemo(() => {
      if (!answerFeedback) return null;
      const iconSrc = answerFeedback === "correct" ? CheckIcon : CrossIcon; 
      const iconAlt =
        answerFeedback === "correct" ? "Correct Answer" : "Incorrect Answer";
      return (
        <div className="answer-feedback-overlay">
          <Image
            src={iconSrc}
            alt={iconAlt}
            className={`feedback-icon feedback-${answerFeedback}`}
          />
        </div>
      );
    }, [answerFeedback]); 

    /**
     * @constant statusTextPositionClass
     * @description Menggunakan `useMemo` untuk menentukan kelas CSS yang mengontrol posisi teks status
     * (`animatedStatusText`) relatif terhadap profil.
     * @returns {string} Nama kelas CSS untuk posisi teks status.
     */
    const statusTextPositionClass = useMemo(() => {
      switch (position) {
        case "top-left":
          return "player-status-text-bottom"; 
        case "left":
          return "player-status-text-bottom";
        case "right":
        case "bottom-right":
        default:
          return "player-status-text-top";
      }
    }, [position]); 

    /**
     * @constant styling
     * @description Menggunakan `useMemo` untuk mengumpulkan kelas CSS dan variabel CSS kustom
     * yang diterapkan pada container profil.
     * @returns {Object} Objek yang berisi `className` dan `customCssVars`.
     */
    const styling = useMemo(
      () => ({
        className: `player-profile-container player-profile-${position} ${statusTextPositionClass}`,
        customCssVars: { "--total-player-cards": totalCards }, // Variabel CSS kustom untuk jumlah kartu
      }),
      [position, totalCards, statusTextPositionClass] 
    );

    /**
     * @constant svgCalculations
     * @description Menggunakan `useMemo` untuk menghitung dimensi dan parameter yang diperlukan
     * untuk rendering SVG lingkaran timer.
     * @returns {Object} Objek berisi `svgDisplaySize`, `circleCenterCoordinate`, `circleCircumference`, dan `viewBox`.
     */
    const svgCalculations = useMemo(() => {
      const svgDisplaySize = radius * 2 + STROKE_WIDTH * 2; // Ukuran total SVG
      const circleCenterCoordinate = svgDisplaySize / 2; // Koordinat tengah lingkaran
      const circleCircumference = 2 * Math.PI * radius; // Keliling lingkaran
      return {
        svgDisplaySize,
        circleCenterCoordinate,
        circleCircumference,
        viewBox: `0 0 ${svgDisplaySize} ${svgDisplaySize}`,
      };
    }, [radius]); 

    /**
     * @constant timerData
     * @description Menggunakan `useMemo` untuk menghitung properti `strokeDashoffset` dan `strokeColor`
     * untuk lingkaran timer SVG, berdasarkan sisa waktu dan durasi maksimum.
     * Warna stroke berubah berdasarkan persentase sisa waktu.
     * @returns {Object} Objek berisi `strokeDashoffset` dan `strokeColor`.
     */
    const timerData = useMemo(() => {
      if (!isActive || maxTime === 0) {
        return {
          strokeDashoffset: svgCalculations.circleCircumference, 
          strokeColor: STROKE_COLORS.TRANSPARENT,
        };
      }

      // Pastikan timeLeft berada dalam batas valid
      const clampedTimeLeft = Math.max(0, Math.min(maxTime, timeLeft));
      const progressPercentage = clampedTimeLeft / maxTime; 
      const timePercentage = progressPercentage * 100; 

      let strokeColor = STROKE_COLORS.TRANSPARENT;
      if (timePercentage > TIME_THRESHOLDS.HIGH) {
        strokeColor = STROKE_COLORS.HIGH;
      } else if (timePercentage > TIME_THRESHOLDS.MEDIUM) {
        strokeColor = STROKE_COLORS.MEDIUM;
      } else if (timePercentage > TIME_THRESHOLDS.LOW) {
        strokeColor = STROKE_COLORS.LOW;
      }
      return {
        strokeDashoffset:
          svgCalculations.circleCircumference * (1 - progressPercentage),
        strokeColor,
      };
    }, [timeLeft, maxTime, isActive, svgCalculations.circleCircumference]); 

    /**
     * @constant timerSvg
     * @description Menggunakan `useMemo` untuk merender elemen SVG yang membentuk lingkaran timer.
     * Lingkaran ini menampilkan progres waktu giliran pemain.
     * @returns {JSX.Element|null} Elemen JSX `svg` untuk timer atau `null` jika tidak aktif.
     */
    const timerSvg = useMemo(() => {
      if (!isActive) return null; 

      return (
        <svg
          width={svgCalculations.svgDisplaySize}
          height={svgCalculations.svgDisplaySize}
          viewBox={svgCalculations.viewBox}
          className="profile-border-svg"
        >
          <circle
            cx={svgCalculations.circleCenterCoordinate}
            cy={svgCalculations.circleCenterCoordinate}
            r={radius}
            stroke={timerData.strokeColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={svgCalculations.circleCircumference} 
            strokeDashoffset={timerData.strokeDashoffset} 
            strokeLinecap="round"
          />
        </svg>
      );
    }, [isActive, svgCalculations, radius, timerData]);
    return (
      <div className={styling.className} style={styling.customCssVars}>
        {animatedStatusText && (
          <div className="player-status-text">{animatedStatusText}</div>
        )}
        {timerSvg}
        <Image
          src={profileImage}
          roundedCircle
          className="user-profile-image"
          alt="User Profile"
          onError={(e) => {
            e.target.src = DefaultProfileImage;
          }}
        />
        {feedbackIcon}
      </div>
    );
  }
);

/**
 * @exports PlayerProfileNuca
 * @description Komponen `PlayerProfileNuca` diekspor sebagai memoized component
 * untuk mengoptimalkan kinerja dengan mencegah re-render yang tidak perlu
 * jika propertinya tidak berubah secara dangkal (shallowly).
 */
export default PlayerProfileNuca;