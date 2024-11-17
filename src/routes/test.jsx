return (
    <Container
      fluid
      className="nuca-container d-flex justify-content-around flex-column"
    >
      <HeaderNuca layout="home" />
  
      {/* Top Player */}
      <Row className="align-items-center justify-content-center">
        <Col xs="auto" className="text-center position-relative ms-5 ps-5">
          <div
            onClick={() => handleDeckCardClick("top")}
            className="d-flex align-items-center"
          >
            {currentTurn === "top" && turnTimeRemaining !== null && (
              <div className="timer-overlay-above">{turnTimeRemaining}</div>
            )}
            {showPopup && !hasAnswered && answeringPlayer === "top" && (
              <div className="timer-overlay">{timeRemaining}</div>
            )}
            <DeckPlayer
              count={deckCounts.top}
              isNew={deckCounts.top === 0}
              position="left"
            />
          </div>
        </Col>
  
        <Col
          xs="auto"
          className="d-flex flex-column position-relative ms-5 ps-5"
        >
          <Image
            src={players[2]?.photoURL || defaultPlayerPhoto}
            alt="Player Profile"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
            }}
            className={getPlayerClass("top")}
          />
          <div className="player-name mt-2">
            {players[2]?.displayName || "Top Player"}
          </div>
          {renderFeedbackIcon("top")}
        </Col>
      </Row>
  
      {/* Middle Row */}
      <Container fluid>
        <Row className="mb-5 mt-0">
          {/* Left Deck */}
          <Col md={3} className="position-relative deck-position-left">
            <div
              className="d-flex flex-column align-items-center position-relative"
              onClick={() => handleDeckCardClick("left")}
            >
              {currentTurn === "left" && turnTimeRemaining !== null && (
                <div className="timer-overlay-above">{turnTimeRemaining}</div>
              )}
              {showPopup && !hasAnswered && answeringPlayer === "left" && (
                <div className="timer-overlay">{timeRemaining}</div>
              )}
              <Image
                src={players[3]?.photoURL || defaultPlayerPhoto}
                alt="Player Left"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                }}
                className={getPlayerClass("left")}
              />
              <div className="player-name">
                {players[3]?.displayName || "Left Player"}
              </div>
              {renderFeedbackIcon("left")}
              <DeckPlayer
                count={deckCounts.left}
                isNew={deckCounts.left === 0}
                style={{ transform: "rotate(900deg)" }}
              />
            </div>
          </Col>
  
          {/* Center Deck */}
          <Col
            md={2}
            className="deck-tengah position-relative d-flex justify-content-center align-items-center"
          >
            <DeckPlayer count={4} isNew={false} />
            <div
              className={`position-absolute d-flex justify-content-center align-items-center ${
                isShuffling ? "shuffle-rotate" : ""
              }`}
              style={{ width: "250px", height: "250px", zIndex: 1 }}
            >
              <Image
                src={shuffleIcon}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </Col>
  
          {/* Right Deck */}
          <Col md={2} className="position-relative deck-position-right">
            <div
              className="d-flex flex-column align-items-center position-relative"
              onClick={() => handleDeckCardClick("right")}
            >
              {currentTurn === "right" && turnTimeRemaining !== null && (
                <div className="timer-overlay-above">{turnTimeRemaining}</div>
              )}
              {showPopup && !hasAnswered && answeringPlayer === "right" && (
                <div className="timer-overlay">{timeRemaining}</div>
              )}
              <Image
                src={players[1]?.photoURL || defaultPlayerPhoto}
                alt="Player Right"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                }}
                className={getPlayerClass("right")}
              />
              <div className="player-name">
                {players[1]?.displayName || "Right Player"}
              </div>
              {renderFeedbackIcon("right")}
              <DeckPlayer
                count={deckCounts.right}
                isNew={deckCounts.right === 0}
                position="right"
                className="deck-kanan-rotate"
              />
            </div>
          </Col>
        </Row>
      </Container>
  
      {/* Bottom Row */}
      <Row className="align-items-center justify-content-center">
        <Col xs={"auto"} className="text-center ml-5 ms-5 position-relative">
          <div style={{ position: "relative" }}>
            {showPopup && !hasAnswered && answeringPlayer === "bottom" && (
              <div className="timer-overlay">{timeRemaining}</div>
            )}
            {currentTurn === "bottom" && turnTimeRemaining !== null && (
              <div className="timer-overlay-above">{turnTimeRemaining}</div>
            )}
            <BottomDeckCard
              cards={cards}
              onCardClick={handleBottomCardClick}
              showPopup={showPopup}
              isExitingPopup={isExitingPopup}
            />
            {renderFeedbackIcon("bottom")}
          </div>
        </Col>
        <Col
          xs="auto"
          className="d-flex flex-column align-items-center p-3 position-relative"
        >
          <Image
            src={players[0]?.photoURL || defaultPlayerPhoto}
            alt="Player Bottom"
            style={{ width: "80px", height: "80px", borderRadius: "50%" }}
            className={getPlayerClass("bottom")}
          />
          <div className="player-name">
            {players[0]?.displayName || "Bottom Player"}
          </div>
        </Col>
      </Row>
  
      {/* Show the question popup */}
      {showPopup && activeCard && !hasAnswered && (
        <>
          <div style={{ position: "relative", zIndex: "2000" }}>
            <PertanyaanNuca
              question={activeCard.question}
              options={activeCard.options}
              correctAnswer={activeCard.correctAnswer}
              onAnswerSelect={handleAnswerSelect}
              isExiting={isExitingPopup}
            />
          </div>
          <div className="potion-icon">
            <Potion />
          </div>
        </>
      )}
  
      {/* Show Overlay Victory */}
      {victory && (
        <div className="victory-overlay" onClick={() => navigate("/")}>
          <img src={victoryImage} alt="Victory Logo" className="victory-logo" />
          <p>Pemenang: {getWinnerName()}</p>
          <p>Kamu mendapatkan:</p>
          <div className="rewards">
            <img
              src={Achievement}
              alt="achievement"
              className="Achievement1-logo"
            />
            <img
              src={Achievement2}
              alt="achievement2"
              className="Achievement2-logo"
            />
            <img src={potionImage} alt="potion" className="potion-logo" />
          </div>
          <p>Sentuh dimana saja untuk keluar
        </p>
        </div>
      )}
    </Container>
  );
