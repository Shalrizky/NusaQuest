import { useEffect, useState, useRef, useCallback } from "react";
import {
  updateGameState,
  listenToGameTimer,
  stopGameTimer,
  updatePlayerActivity,
  checkInactivePlayers,
  cleanupGame,
} from "../services/gameDataServices";

/**
 * @hook usePlayerTimer
 * @description Custom hook untuk mengelola timer giliran pemain individu dalam game.
 * Hook ini bertanggung jawab untuk mengatur dan memperbarui sisa waktu giliran pemain,
 * serta memicu aksi ketika waktu habis. Ini juga menyinkronkan waktu dengan Firebase.
 * @param {number} initialTime - Waktu awal dalam detik untuk timer giliran pemain.
 * @param {function(): void} onTimeEnd - Fungsi callback yang akan dipanggil ketika timer berakhir (waktu habis).
 * @param {Object} gameData - Objek yang berisi data relevan tentang game dan pemain saat ini.
 * @param {string} gameData.topicID - ID topik permainan.
 * @param {string} gameData.gameID - ID permainan.
 * @param {string} gameData.roomID - ID ruangan permainan.
 * @param {boolean} gameData.isMyTurn - Status boolean apakah giliran pemain lokal saat ini.
 * @param {number} gameData.currentPlayerIndex - Indeks global pemain yang gilirannya saat ini.
 * @param {Array<number>} gameData.playerTimers - Array yang berisi sisa waktu untuk setiap pemain (dari gameState Firebase).
 * @param {number} gameData.players.length - Jumlah total pemain dalam game.
 * @returns {[number, function(): void]} Sebuah tuple berisi:
 * - `timeLeft`: Sisa waktu saat ini dalam detik.
 * - `resetTimer`: Fungsi untuk mereset timer ke `initialTime`.
 */
export const usePlayerTimer = (initialTime, onTimeEnd, gameData) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerIdRef = useRef(null);
  const playerTimersRef = useRef(gameData.playerTimers);
  const playersLengthRef = useRef(gameData.players?.length);

  /**
   * @effect Memperbarui Ref Timer Pemain
   * @description Memperbarui `playerTimersRef` dan `playersLengthRef` setiap kali `gameData.playerTimers`
   * atau `gameData.players.length` berubah. Ini memastikan ref selalu memiliki nilai terbaru.
   */
  useEffect(() => {
    playerTimersRef.current = gameData.playerTimers;
    playersLengthRef.current = gameData.players?.length;
  }, [gameData.playerTimers, gameData.players?.length]);

  /**
   * @function stableOnTimeEnd
   * @description Versi memoized dari fungsi `onTimeEnd` menggunakan `useCallback`.
   * Ini memastikan `onTimeEnd` tidak berubah di setiap render, menghindari re-trigger `useEffect` yang tidak perlu.
   */
  const stableOnTimeEnd = useCallback(onTimeEnd, [onTimeEnd]);

  /**
   * @effect Reset Timer Saat Giliran Berubah
   * @description Mereset timer lokal (`timeLeft`) ke `initialTime` dan memperbarui `playerTimers` di Firebase
   * setiap kali giliran pemain lokal menjadi aktif (`gameData.isMyTurn` berubah menjadi true).
   */
  useEffect(() => {
    if (gameData?.isMyTurn) {
      setTimeLeft(initialTime);
      if (gameData?.topicID && gameData?.gameID && gameData?.roomID) {
        const newTimers = Array.isArray(playerTimersRef.current)
          ? [...playerTimersRef.current]
          : new Array(playersLengthRef.current || 1).fill(initialTime);
        newTimers[gameData.currentPlayerIndex] = initialTime;
        updateGameState(gameData.topicID, gameData.gameID, gameData.roomID, {
          playerTimers: newTimers,
        }).catch(console.error);
      }
    }
  }, [
    gameData?.currentPlayerIndex,
    gameData?.isMyTurn,
    initialTime,
    gameData?.topicID,
    gameData?.gameID,
    gameData?.roomID,
  ]);

  /**
   * @effect Pengelolaan Countdown Timer
   * @description Mengelola interval countdown timer lokal.
   * Timer akan aktif hanya ketika giliran pemain lokal. Ini juga memperbarui
   * `playerTimers` di Firebase setiap detik.
   * Ketika waktu habis, interval dibersihkan dan `stableOnTimeEnd` dipanggil.
   */
  useEffect(() => {
    if (gameData?.isMyTurn) {
      timerIdRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);
          if (
            gameData?.topicID &&
            gameData?.gameID &&
            gameData?.roomID &&
            newTime > 0
          ) {
            const newTimers = Array.isArray(playerTimersRef.current)
              ? [...playerTimersRef.current]
              : new Array(playersLengthRef.current || 1).fill(initialTime);
            newTimers[gameData.currentPlayerIndex] = newTime;
            updateGameState(
              gameData.topicID,
              gameData.gameID,
              gameData.roomID,
              {
                playerTimers: newTimers,
              }
            ).catch(console.error);
          }
          if (newTime <= 0) {
            clearInterval(timerIdRef.current); 
            timerIdRef.current = null;
            stableOnTimeEnd?.();
          }
          return newTime;
        });
      }, 1000); 

      return () => {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      };
    } else {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, [
    gameData?.isMyTurn,
    initialTime,
    gameData?.currentPlayerIndex,
    gameData?.topicID,
    gameData?.gameID,
    gameData?.roomID,
    stableOnTimeEnd,
  ]);

  /**
   * @function resetTimer
   * @description Fungsi untuk mereset timer secara manual ke `initialTime` dan memperbarui statusnya di Firebase.
   * @returns {void}
   */
  const resetTimer = useCallback(() => {
    setTimeLeft(initialTime);
    if (gameData?.topicID && gameData?.gameID && gameData?.roomID) {
      const newTimers = Array.isArray(playerTimersRef.current)
        ? [...playerTimersRef.current]
        : new Array(playersLengthRef.current || 1).fill(initialTime);
      newTimers[gameData.currentPlayerIndex] = initialTime;
      updateGameState(gameData.topicID, gameData.gameID, gameData.roomID, {
        playerTimers: newTimers,
      }).catch(console.error); 
    }
  }, [
    initialTime,
    gameData?.topicID,
    gameData?.gameID,
    gameData?.roomID,
    gameData?.currentPlayerIndex,
  ]);

  return [timeLeft, resetTimer];
};

/**
 * @hook usePlayerActivity
 * @description Custom hook untuk mendeteksi aktivitas pengguna (mouse, keyboard, sentuh, dll.)
 * dan memicu callback `onInactivity` jika tidak ada aktivitas selama batas waktu tertentu.
 * Hook ini juga memperbarui timestamp aktivitas pemain di Firebase secara berkala.
 * @param {function(): void} onInactivity - Fungsi callback yang akan dipanggil ketika pemain terdeteksi tidak aktif.
 * @param {number} [inactivityTimeout=300000] - Batas waktu tidak aktif dalam milidetik (default: 60 detik / 1 menit).
 * @param {Object} gameData - Objek berisi data permainan yang diperlukan untuk memperbarui Firebase.
 * @param {string} gameData.topicID - ID topik permainan.
 * @param {string} gameData.gameID - ID permainan.
 * @param {string} gameData.roomID - ID ruangan permainan.
 * @param {Object} gameData.user - Objek pengguna Firebase (`user.uid` digunakan).
 * @returns {{ updateActivity: function(): void, isActive: boolean }} Sebuah objek berisi:
 * - `updateActivity`: Fungsi yang dapat dipanggil secara manual untuk memperbarui status aktivitas.
 * - `isActive`: Status boolean saat ini apakah pemain aktif.
 */
export const usePlayerActivity = (
  onInactivity,
  inactivityTimeout = 300000,
  gameData
) => {
  const lastActivityRef = useRef(Date.now());
  const checkIntervalRef = useRef(null); 
  const isActiveRef = useRef(true);
  const inactivityTimeoutRef = useRef(null);
  const lastFirebaseActivityUpdate = useRef(0);

  /**
   * @function updateActivity
   * @description Memperbarui timestamp aktivitas terakhir dan menjadwalkan ulang timeout ketidakaktifan.
   * Fungsi ini juga akan memicu pembaruan aktivitas ke Firebase setiap 30 detik.
   * @returns {Promise<void>}
   */
  const updateActivity = useCallback(async () => {
    lastActivityRef.current = Date.now();
    if (!isActiveRef.current) {
      isActiveRef.current = true;
    }

    const now = Date.now();
    const shouldUpdateFirebase =
      now - lastFirebaseActivityUpdate.current > 30000;
    if (
      gameData?.topicID &&
      gameData?.gameID &&
      gameData?.roomID &&
      gameData?.user?.uid &&
      shouldUpdateFirebase
    ) {
      lastFirebaseActivityUpdate.current = now;
      try {
        await updatePlayerActivity(
          gameData.topicID,
          gameData.gameID,
          gameData.roomID,
          gameData.user.uid
        );
      } catch (error) {
        console.error("Error updating player activity:", error);
      }
    }

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    inactivityTimeoutRef.current = setTimeout(() => {
      if (isActiveRef.current) {
        isActiveRef.current = false;
        onInactivity?.(); 
      }
    }, inactivityTimeout);
  }, [
    onInactivity,
    inactivityTimeout,
    gameData?.topicID,
    gameData?.gameID,
    gameData?.roomID,
    gameData?.user?.uid,
  ]);

  /**
   * @effect Setup Event Listeners untuk Aktivitas
   * @description Mendaftarkan event listener untuk berbagai interaksi DOM (mouse, keyboard, scroll, touch, click).
   * Setiap interaksi akan memicu fungsi `updateActivity`.
   * Listener didaftarkan dengan `capture: true` (`true` sebagai argumen ketiga) agar dapat menangkap event pada fase capturing.
   */
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true); 
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [updateActivity]);

  /**
   * @effect Deteksi Perubahan Visibilitas Tab
   * @description Mendaftarkan event listener untuk `visibilitychange` API.
   * Ini mendeteksi ketika tab browser menjadi tidak aktif (misalnya, pengguna beralih tab)
   * dan kembali aktif. Ketika tab menjadi aktif kembali, `updateActivity` akan dipanggil.
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Tab menjadi tidak aktif");
      } else {
        console.log("Tab menjadi aktif kembali");
        updateActivity(); 
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [updateActivity]); 

  /**
   * @effect Cleanup Timeout saat Unmount
   * @description Memastikan semua timeout dan interval dibersihkan saat komponen di-unmount
   * untuk mencegah memory leak.
   */
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      if (checkIntervalRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []); 

  /**
   * @effect Pembaruan Aktivitas Awal
   * @description Memanggil `updateActivity` segera setelah komponen mount untuk
   * menetapkan status aktivitas awal.
   */
  useEffect(() => {
    updateActivity();
  }, [updateActivity]);

  return { updateActivity, isActive: isActiveRef.current };
};

/**
 * @hook useGameTimer
 * @description Custom hook untuk mengelola timer global permainan dan mendeteksi ketidakaktifan pemain.
 * Hook ini mendengarkan timer game dari Firebase dan memicu `onGameEnd` ketika waktu game habis.
 * Ini juga menggunakan `usePlayerActivity` untuk memantau aktivitas pemain dan membersihkan game
 * jika pemain menjadi tidak aktif.
 * @param {number} initialTime - Durasi total game dalam detik.
 * @param {function(): void} onGameEnd - Fungsi callback yang akan dipanggil ketika game berakhir (waktu habis atau ditinggalkan).
 * @param {Object} gameData - Objek yang berisi data relevan untuk game.
 * @param {string} gameData.topicID - ID topik permainan.
 * @param {string} gameData.gameID - ID permainan.
 * @param {string} gameData.roomID - ID ruangan permainan.
 * @param {Object} gameData.user - Objek pengguna Firebase (digunakan untuk `cleanupGame`).
 * @returns {{ gameTimeLeft: number, updateActivity: function(): void }} Sebuah objek berisi:
 * - `gameTimeLeft`: Sisa waktu global game saat ini dalam detik.
 * - `updateActivity`: Fungsi yang dapat dipanggil secara manual untuk memperbarui status aktivitas pemain.
 */
export const useGameTimer = (
  initialTime,
  onGameEnd,
  { topicID, gameID, roomID, user }
) => {
  const [gameTimeLeft, setGameTimeLeft] = useState(initialTime);
  const gameEndedRef = useRef(false); 
  const inactivityCheckIntervalRef = useRef(null); 

  /**
   * @function handlePlayerInactivity
   * @description Fungsi callback yang dipicu oleh `usePlayerActivity` ketika pemain terdeteksi tidak aktif.
   * Fungsi ini akan membersihkan game di Firebase dan memicu `onGameEnd`.
   * @returns {Promise<void>}
   */
  const handlePlayerInactivity = useCallback(async () => {
    if (gameEndedRef.current) return;

    console.log("Player tidak aktif selama 1 menit, mengakhiri game...");

    try {
      await cleanupGame(topicID, gameID, roomID, user, "inactivity");
      stopGameTimer(topicID, gameID, roomID);
      gameEndedRef.current = true; 
      onGameEnd?.();
    } catch (error) {
      console.error("Error ending game due to inactivity:", error);
      onGameEnd?.();
    }
  }, [topicID, gameID, roomID, user, onGameEnd]);

  /**
   * @hook usePlayerActivity (Internal to useGameTimer)
   * @description Menggunakan hook `usePlayerActivity` untuk memantau aktivitas pemain
   * dan memicu `handlePlayerInactivity` jika pemain tidak aktif.
   */
  const { updateActivity } = usePlayerActivity(handlePlayerInactivity, 300000, {
    topicID,
    gameID,
    roomID,
    user,
  });

  /**
   * @effect Pemeriksaan Pemain Tidak Aktif Berkala
   * @description Menjadwalkan interval untuk secara berkala memeriksa status pemain tidak aktif
   * di Firebase menggunakan `checkInactivePlayers`. Jika game ditinggalkan, `onGameEnd` akan dipicu.
   */
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;

    inactivityCheckIntervalRef.current = setInterval(async () => {
      if (gameEndedRef.current) return; 

      try {
        const gameAbandoned = await checkInactivePlayers(
          topicID,
          gameID,
          roomID,
          300000
        ); 
        if (gameAbandoned && !gameEndedRef.current) {
          console.log("Game ditinggalkan karena player tidak aktif");
          gameEndedRef.current = true; 
          onGameEnd?.();
        }
      } catch (error) {
        console.error("Error checking inactive players:", error);
      }
    }, 50000); 

    return () => {
      if (inactivityCheckIntervalRef.current) {
        clearInterval(inactivityCheckIntervalRef.current);
      }
    };
  }, [topicID, gameID, roomID, onGameEnd]);

  /**
   * @effect Sinkronisasi Timer Game dengan Firebase
   * @description Mendengarkan timer game global dari Firebase (`listenToGameTimer`)
   * dan memperbarui state `gameTimeLeft` lokal. Juga mengelola interval countdown lokal
   * dan memicu `onGameEnd` ketika waktu game habis.
   */
  useEffect(() => {
    let interval; 
    const unsubscribe = listenToGameTimer(
      topicID,
      gameID,
      roomID,
      (remainingTime) => {
        if (gameEndedRef.current) return;

        setGameTimeLeft(Math.max(0, remainingTime));
        if (remainingTime <= 0) {
          stopGameTimer(topicID, gameID, roomID);
          gameEndedRef.current = true;
          onGameEnd?.();
        } else {
          clearInterval(interval);
          interval = setInterval(() => {
            setGameTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                if (!gameEndedRef.current) {
                  gameEndedRef.current = true;
                  onGameEnd?.();
                }
                return 0;
              }
              return prev - 1; 
            });
          }, 1000);
        }
      }
    );
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [topicID, gameID, roomID, onGameEnd]); 

  return { gameTimeLeft, updateActivity };
};
