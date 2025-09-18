import React from "react";

export default function ScoreScreen({ score, total, onRestart }) {
  const percent = Math.round((score / total) * 100);
  let message = "Better luck next time!";
  if (percent === 100) message = "Perfection! You're a Gaming Legend! 🎮";
  else if (percent >= 80) message = "Amazing — you know your stuff!";
  else if (percent >= 50) message = "Nice! Not bad at all.";

  return (
    <div className="card score-screen">
      <h2>Game Over 🎉</h2>
      <p className="result-msg">
        Your score: <strong>{score}</strong> / {total} ({percent}%)
      </p>
      <p className="result-msg">{message}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 8 }}>
        <button className="btn" onClick={onRestart}>Back to Subjects</button>
      </div>
    </div>
  );
}
