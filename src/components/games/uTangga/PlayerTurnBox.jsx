import React from "react";
import QuestionForm from "./QuestionForm";
import "../../../style/components/games/uTangga/playerTurnBox.css";

function PlayerTurnBox({ 
  players, 
  currentPlayerIndex,
  showQuestion,
  waitingForAnswer,
  currentQuestion,
  onAnswerChange 
}) {
  return (
    <div className="player-turn-box text-center d-flex flex-column align-items-center justify-content-center">
      {players.length > 0 && players[currentPlayerIndex] ? (
        <h4 className="box-player-name">
          {players[currentPlayerIndex].displayName}'s Turn
        </h4>
      ) : (
        <h4 className="box-player-name">Waiting for player...</h4>
      )}

      {showQuestion && waitingForAnswer && (
        <QuestionForm
          question={currentQuestion}
          onAnswerChange={onAnswerChange}
        />
      )}
    </div>
  );
}

export default PlayerTurnBox;