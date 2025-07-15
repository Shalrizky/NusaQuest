import React, { useState, useRef } from "react";

const useDebugTools = ({
  currentUserId,
  currentPlayerGlobalIndex,
  timeLeft,
  isMyTurnValue, // Sekarang menerima nilai boolean langsung
  playerTimersData,
  getPlayerAtRelativePosition,
  handleDebugSwitchTurn,
  handleDebugSwitchUser,
  currentTurnPhase,
  playerAnsweringGlobalIndex,
}) => {
  const [position, setPosition] = useState({ x: 10, y: 10 }); // Initial position
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 }); // To store the offset from mouse to panel top-left

  const DebugPanel = () => {
    const panelRef = useRef(null);

    // Handler untuk memulai proses seret, hanya dipanggil di drag handle
    const handleMouseDown = (e) => {
      setIsDragging(true);
      // Calculate offset from mouse position to the panel's top-left corner
      // Gunakan e.currentTarget.getBoundingClientRect().left/top untuk mendapatkan posisi handle
      // dan panelRef.current.getBoundingClientRect().left/top untuk mendapatkan posisi panel
      offset.current = {
        x: e.clientX - panelRef.current.getBoundingClientRect().left,
        y: e.clientY - panelRef.current.getBoundingClientRect().top,
      };
      // Mencegah pemilihan teks saat menyeret
      e.preventDefault();
    };

    // Handler untuk menggerakkan panel, dipanggil di window untuk responsif yang lebih baik
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    };

    // Handler untuk menghentikan proses seret, dipanggil di window
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Efek samping untuk menambahkan dan menghapus event listener ke window
    React.useEffect(() => {
      if (isDragging) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
      // Cleanup function
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isDragging]); // Bergantung pada isDragging

    return (
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "12px",
          zIndex: 9999,
          // Cursor default untuk panel, kecuali handle
        }}
      >
        {/* Drag Handle */}
        <div
          style={{
            cursor: "grab",
            padding: "5px",
            marginBottom: "10px",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "3px",
            textAlign: "center",
            fontWeight: "bold",
          }}
          onMouseDown={handleMouseDown} // Hanya handle ini yang memulai drag
        >
          DRAG ME ↔️
        </div>

        <div>
          <strong>Pengguna Saat Ini:</strong> {currentUserId}
        </div>
        <div>
          <strong>Pemain Aktif Saat Ini:</strong> P{currentPlayerGlobalIndex + 1}
        </div>
        <div>
          <strong>Sisa Waktu untuk Saat Ini:</strong> {timeLeft}s
        </div>
        {/* Gunakan isMyTurnValue (yang sudah boolean) tanpa memanggilnya */}
        <div>
          <strong>Giliran Saya (Lempar):</strong> {isMyTurnValue ? "YA" : "TIDAK"}
        </div>
        <div>
          <strong>Fase Giliran:</strong> {currentTurnPhase}
        </div>
        {playerAnsweringGlobalIndex !== null && (
          <div>
            <strong>Pemain Menjawab:</strong> P{playerAnsweringGlobalIndex + 1}
          </div>
        )}
        <hr style={{ borderColor: "white", margin: "5px 0" }} />

        <div>
          <strong>Pemetaan Posisi:</strong>
        </div>
        <div>Bawah: {currentUserId}</div>
        <div>Kiri: {getPlayerAtRelativePosition("left")}</div>
        <div>Atas: {getPlayerAtRelativePosition("top")}</div>
        <div>Kanan: {getPlayerAtRelativePosition("right")}</div>
        <hr style={{ borderColor: "white", margin: "5px 0" }} />

        <div>
          <strong>Timer Pemain:</strong>
        </div>
        {playerTimersData.map((timer, index) => (
          <div key={index}>
            P{index + 1}: {timer}s{" "}
            {currentPlayerGlobalIndex === index && "(AKTIF)"}
          </div>
        ))}
        <hr style={{ borderColor: "white", margin: "5px 0" }} />

        <button
          onClick={handleDebugSwitchTurn}
          style={{ marginTop: "5px", fontSize: "10px", padding: "5px 10px" }}
        >
          Pemain Berikutnya (Debug)
        </button>
        <br />
        <div style={{ marginTop: "10px" }}>
          <div>
            <strong>Ganti Pengguna:</strong>
          </div>
          {["player1", "player2", "player3", "player4"].map((playerId) => (
            <button
              key={playerId}
              onClick={() => handleDebugSwitchUser(playerId)}
              style={{
                fontSize: "8px",
                padding: "2px 5px",
                margin: "2px",
                backgroundColor:
                  currentUserId === playerId ? "#007bff" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "3px",
              }}
            >
              {playerId}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return { DebugPanel };
};

export default useDebugTools; 