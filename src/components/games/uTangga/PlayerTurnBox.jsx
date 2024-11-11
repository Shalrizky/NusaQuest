import React from "react";
import QuestionForm from "./QuestionForm";
import "../../../style/components/games/uTangga/playerTurnBox.css";

function PlayerTurnBox({ 
  players, 
  currentPlayerIndex,
  showQuestion,
  waitingForAnswer,
  currentQuestion,
  onAnswerChange,
  isMyTurn 
}) {
  return (
    <div className="player-turn-box text-center d-flex flex-column align-items-center justify-content-center">
      {players.length > 0 && players[currentPlayerIndex] ? (
        <h4 className="box-player-name">
          {isMyTurn ? "Your Turn!" : `${players[currentPlayerIndex].displayName}'s Turn`}
        </h4>
      ) : (
        <h4 className="box-player-name">Waiting for player...</h4>
      )}

      {showQuestion && waitingForAnswer && currentQuestion && (
        <QuestionForm
          question={currentQuestion}
          onAnswerChange={onAnswerChange}
          isMyTurn={isMyTurn}
        />
      )}
    </div>
  );
}

export default PlayerTurnBox;
