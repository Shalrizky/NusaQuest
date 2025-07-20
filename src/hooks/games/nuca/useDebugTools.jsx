import {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import { Card, Button, Row, Col, Badge, Collapse } from "react-bootstrap";

const CARD_STYLE = {
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "white",
};

const PHASE_CONFIG = {
  throwing: {
    status: "THROWING",
    color: "success",
    icon: "🎯",
    text: "Throwing Card",
  },
  answering: {
    status: "ANSWERING",
    color: "info",
    icon: "🤔",
    text: "Answering Question",
  },
  default: {
    status: "WAITING",
    color: "secondary",
    icon: "⏳",
    text: "Waiting",
  },
};

const useDebugTools = ({
  currentUserId,
  currentPlayerGlobalIndex,
  timeLeft,
  isMyTurnValue,
  playerTimersData,
  getPlayerAtRelativePosition,
  handleDebugSwitchTurn,
  handleDebugSwitchUser,
  currentTurnPhase,
  playerAnsweringGlobalIndex,
  triggerAutoEndTimer,
  simulateAnswer,
  currentQuestion,
  isQuestionModalActive,
  addPenaltyCard,
  currentGameState,
}) => {
  // UI State
  const [isVisible, setIsVisible] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    controls: true,
    timers: false,
    positions: false,
    simulateAnswer: true,
  });

  // Drag State
  const [panelPosition, setPanelPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const panelRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const scrollContentRef = useRef(null);
  const lastScrollTop = useRef(0);

  // Memoized callbacks to prevent re-renders
  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handleDragStart = useCallback((e) => {
    if (e.target.dataset.dragHandle === "true") {
      setIsDragging(true);
      if (panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        dragOffset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
      e.preventDefault();
    }
  }, []);

  const handleDrag = useCallback(
    (e) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      const maxX = window.innerWidth - 350;
      const maxY = window.innerHeight - 100;

      setPanelPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  const handleScroll = useCallback(() => {
    if (scrollContentRef.current) {
      lastScrollTop.current = scrollContentRef.current.scrollTop;
    }
  }, []);

  // Effects
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDrag);
        window.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  useLayoutEffect(() => {
    if (scrollContentRef.current && lastScrollTop.current > 0) {
      scrollContentRef.current.scrollTop = lastScrollTop.current;
    }
  });

  // Memoized computed values
  const gameData = useMemo(() => {
    const playerActiveId = `player${currentPlayerGlobalIndex + 1}`;
    const playerAnsweringId =
      playerAnsweringGlobalIndex !== null
        ? `player${playerAnsweringGlobalIndex + 1}`
        : null;

    const phaseConfig = PHASE_CONFIG[currentTurnPhase] || PHASE_CONFIG.default;
    const statusColor =
      currentTurnPhase === "throwing" && isMyTurnValue
        ? "success"
        : phaseConfig.color;

    return {
      userId: currentUserId,
      activePlayerId: playerActiveId,
      playerAnsweringId,
      timeLeft,
      isMyTurn: isMyTurnValue,
      currentPhase: currentTurnPhase,
      activePlayerStatus: phaseConfig.status,
      statusColor,
      timeStatus:
        timeLeft > 15 ? "success" : timeLeft > 8 ? "warning" : "danger",
    };
  }, [
    currentUserId,
    currentPlayerGlobalIndex,
    timeLeft,
    isMyTurnValue,
    currentTurnPhase,
    playerAnsweringGlobalIndex,
  ]);

  const availablePlayers = useMemo(() => {
    if (!currentGameState?.playerStatus) {
      return ["player1", "player2", "player3", "player4"].slice(
        0,
        playerTimersData.length || 4
      );
    }
    return ["player1", "player2", "player3", "player4"].filter(
      (playerId) => currentGameState.playerStatus[playerId] === "available"
    );
  }, [currentGameState?.playerStatus, playerTimersData.length]);

  const playerPositions = useMemo(() => {
    const positions = [
      { key: "bottom", label: "You", id: currentUserId },
      {
        key: "left",
        label: "Left",
        id: getPlayerAtRelativePosition(currentUserId, "left"),
      },
      {
        key: "top",
        label: "Top",
        id: getPlayerAtRelativePosition(currentUserId, "top"),
      },
      {
        key: "right",
        label: "Right",
        id: getPlayerAtRelativePosition(currentUserId, "right"),
      },
    ];

    return positions.map((pos) => {
      const isActive = pos.id === gameData.activePlayerId;
      const isAnswering = pos.id === gameData.playerAnsweringId;
      const isCurrentUser = pos.id === gameData.userId;

      let variant = "outline-secondary";
      let phaseInfo = "⏳ Waiting";

      if (isActive) {
        variant = "outline-primary";
        const config = PHASE_CONFIG[currentTurnPhase] || PHASE_CONFIG.default;
        phaseInfo = `${config.icon} ${config.text}`;
      } else if (isAnswering) {
        variant = "outline-warning";
        phaseInfo = "🤔 Answering Question";
      } else if (isCurrentUser) {
        variant = "outline-success";
        phaseInfo = "👤 Your Position";
      }

      return {
        ...pos,
        variant,
        phaseInfo,
        isActive,
        isAnswering,
        isCurrentUser,
      };
    });
  }, [gameData, currentUserId, getPlayerAtRelativePosition, currentTurnPhase]);

  const playerTimers = useMemo(
    () =>
      playerTimersData.map((timer, i) => {
        const playerId = `player${i + 1}`;
        const isActive = playerId === gameData.activePlayerId;
        const isAnswering = playerId === gameData.playerAnsweringId;

        let variant = "secondary";
        let phaseDisplay = "WAITING";

        if (isActive) {
          variant = "primary";
          phaseDisplay =
            currentTurnPhase === "throwing" ? "THROWING" : "ACTIVE";
        } else if (isAnswering) {
          variant = "warning";
          phaseDisplay = "ANSWERING";
        }

        return {
          name: `P${i + 1}`,
          time: timer,
          variant,
          phaseDisplay,
          timeVariant:
            timer < 10 ? (timer < 5 ? "danger" : "warning") : "success",
        };
      }),
    [
      playerTimersData,
      gameData.activePlayerId,
      gameData.playerAnsweringId,
      currentTurnPhase,
    ]
  );

  // Component builders
  const PlayerButton = useCallback(
    ({ id, isCurrentUser, isAvailable }) => (
      <Button
        variant={isCurrentUser ? "success" : "outline-secondary"}
        size="sm"
        style={{
          fontSize: "10px",
          padding: "2px 6px",
          opacity: isAvailable ? 1 : 0.3,
        }}
        onClick={() => isAvailable && handleDebugSwitchUser(id)}
        disabled={!isAvailable}
      >
        {id.slice(-1)}
        {isCurrentUser && " ✓"}
      </Button>
    ),
    [handleDebugSwitchUser]
  );

  const InfoRow = useCallback(
    ({ label, children }) => (
      <Row className="g-1 mb-2">
        <Col xs={4}>
          <small>{label}:</small>
        </Col>
        <Col xs={8}>{children}</Col>
      </Row>
    ),
    []
  );

  const SectionCard = useCallback(
    ({ title, icon, sectionKey, children, isLast = false }) => (
      <Card style={{ ...CARD_STYLE, marginBottom: isLast ? "0" : "10px" }}>
        <Card.Header
          className="py-2 d-flex justify-content-between align-items-center"
          style={{ cursor: "pointer" }}
          onClick={() => toggleSection(sectionKey)}
        >
          <small className="fw-bold">
            {icon} {title}
          </small>
          <small>{expandedSections[sectionKey] ? "▼" : "▶"}</small>
        </Card.Header>
        <Collapse in={expandedSections[sectionKey]}>
          <Card.Body className="p-2">{children}</Card.Body>
        </Collapse>
      </Card>
    ),
    [expandedSections, toggleSection]
  );

  const DebugPanel = () => {
    if (!isVisible) {
      return (
        <Button
          variant="success"
          size="sm"
          onClick={() => setIsVisible(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 9999,
            ...CARD_STYLE,
          }}
        >
          🛠️ Debug
        </Button>
      );
    }

    return (
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: panelPosition.y,
          left: panelPosition.x,
          width: "350px",
          maxHeight: "80vh",
          zIndex: 9999,
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
        <Card style={CARD_STYLE}>
          <Card.Header
            className="d-flex justify-content-between align-items-center py-2"
            data-drag-handle="true"
            onMouseDown={handleDragStart}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
            }}
          >
            <small className="fw-bold">🃏 Game Debug Tools</small>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => setIsVisible(false)}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ padding: "2px 8px" }}
            >
              ✕
            </Button>
          </Card.Header>

          <div
            ref={scrollContentRef}
            onScroll={handleScroll}
            style={{
              maxHeight: "calc(80vh - 50px)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Card.Body className="p-3">
              {/* Answer Simulation */}
              {isQuestionModalActive && currentQuestion && (
                <SectionCard
                  title="Simulate Answer"
                  icon="❓"
                  sectionKey="simulateAnswer"
                >
                  {/* Tampilkan siapa yang sedang menjawab */}
                  <div className="mb-2">
                    <small>Pemain Aktif Menjawab: </small>
                    <Badge
                      bg={
                        gameData.playerAnsweringId === gameData.userId
                          ? "info"
                          : "primary"
                      }
                    >
                      {gameData.playerAnsweringId
                        ? gameData.playerAnsweringId.replace("player", "P")
                        : "N/A"}
                    </Badge>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => simulateAnswer(true)}
                      disabled={!gameData.playerAnsweringId}
                    >
                      ✅ Benar (Pemain Aktif)
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => simulateAnswer(false)}
                      disabled={!gameData.playerAnsweringId}
                    >
                      ❌ Salah (Pemain Aktif)
                    </Button>
                  </div>
                </SectionCard>
              )}

              {/* Player Overview */}
              <SectionCard title="Overview" icon="👤" sectionKey="overview">
                <InfoRow label="User">
                  <div className="d-flex gap-1 flex-wrap">
                    {["player1", "player2", "player3", "player4"].map((id) => (
                      <PlayerButton
                        key={id}
                        id={id}
                        isCurrentUser={gameData.userId === id}
                        isAvailable={availablePlayers.includes(id)}
                      />
                    ))}
                  </div>
                </InfoRow>
                <InfoRow label="Active">
                  <Badge bg={gameData.statusColor}>
                    {gameData.activePlayerId}
                  </Badge>
                </InfoRow>
                <InfoRow label="Phase">
                  <Badge bg={gameData.statusColor}>
                    {gameData.activePlayerStatus}
                  </Badge>
                </InfoRow>
                <InfoRow label="Time">
                  <Badge bg={gameData.timeStatus}>{gameData.timeLeft}s</Badge>
                </InfoRow>
                <Row className="g-1">
                  <Col xs={4}>
                    <small>My Turn:</small>
                  </Col>
                  <Col xs={8}>
                    <Badge bg={gameData.isMyTurn ? "success" : "danger"}>
                      {gameData.isMyTurn ? "YES" : "NO"}
                    </Badge>
                  </Col>
                </Row>
              </SectionCard>

              {/* Game Controls */}
              <SectionCard title="Controls" icon="🎮" sectionKey="controls">
                <Row className="g-2 mb-2">
                  <Col xs={6}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-100"
                      onClick={handleDebugSwitchTurn}
                      style={{ fontSize: "11px" }}
                    >
                      ⏭️ Next Turn
                    </Button>
                  </Col>
                  <Col xs={6}>
                    <Button
                      variant="warning"
                      size="sm"
                      className="w-100"
                      onClick={triggerAutoEndTimer}
                      style={{ fontSize: "11px" }}
                    >
                      ⏹️ End Timer
                    </Button>
                  </Col>
                </Row>
                <Row className="g-2">
                  <Col xs={6}>
                    <Button
                      variant="info"
                      size="sm"
                      className="w-100"
                      onClick={addPenaltyCard}
                      style={{ fontSize: "11px" }}
                    >
                      🃏 +Penalty
                    </Button>
                  </Col>
                </Row>
              </SectionCard>

              {/* Player Timers */}
              <SectionCard title="Timers" icon="⏱️" sectionKey="timers">
                <Row className="g-1">
                  {playerTimers.map((timer, i) => (
                    <Col xs={6} key={i}>
                      <div
                        className="text-center p-2 rounded"
                        style={{
                          border: `1px solid var(--bs-${timer.variant})`,
                          backgroundColor: `rgba(var(--bs-${timer.variant}-rgb), 0.1)`,
                        }}
                      >
                        <Badge bg={timer.variant}>{timer.name}</Badge>
                        <div>
                          <Badge bg={timer.timeVariant}>{timer.time}s</Badge>
                        </div>
                        <div style={{ fontSize: "9px", marginTop: "2px" }}>
                          {timer.phaseDisplay}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </SectionCard>

              {/* Player Positions */}
              <SectionCard
                title="Positions"
                icon="🗺️"
                sectionKey="positions"
                isLast
              >
                <Row className="g-1">
                  {playerPositions.map((pos, i) => (
                    <Col xs={6} key={i}>
                      <div
                        className="text-center p-2 rounded border"
                        style={{
                          borderColor: `var(--bs-${pos.variant.replace(
                            "outline-",
                            ""
                          )})`,
                        }}
                      >
                        <div>
                          <small className="fw-bold">{pos.label}</small>
                        </div>
                        <div>
                          <small>{pos.id}</small>
                        </div>
                        <div
                          style={{
                            fontSize: "9px",
                            marginTop: "4px",
                            color: pos.isActive
                              ? "#007bff"
                              : pos.isAnswering
                              ? "#fd7e14"
                              : "#6c757d",
                          }}
                        >
                          {pos.phaseInfo}
                        </div>
                        {pos.isActive && (
                          <Badge bg="primary" className="mt-1">
                            Active
                          </Badge>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </SectionCard>
            </Card.Body>
          </div>
        </Card>
      </div>
    );
  };

  return { DebugPanel };
};

export default useDebugTools;
