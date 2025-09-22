// src/pages/Leaderboard.jsx
import React from 'react';
import { getLeaderboard, clearLeaderboard } from '../utils/leaderboard';

export default function Leaderboard() {
  const [scores, setScores] = React.useState(getLeaderboard());

  const handleClear = () => {
    clearLeaderboard();
    setScores([]);
  };

  return (
    <div className="leaderboard-page">
      <h2 className="leaderboard-title">🏆 Leaderboard</h2>
      {scores.length === 0 ? (
        <p className="leaderboard-empty">No high scores yet. Play to set a record!</p>
      ) : (
        <ol className="leaderboard-list">
          {scores.map((entry, idx) => (
            <li key={idx} className={idx === 0 ? 'leaderboard-top' : ''}>
              <span className="leaderboard-rank">{idx + 1}</span>
              <span className="leaderboard-name">{entry.name}</span>
              <span className="leaderboard-score">{entry.score} pts</span>
              <span className="leaderboard-date">{new Date(entry.date).toLocaleDateString()}</span>
            </li>
          ))}
        </ol>
      )}
      <button className="leaderboard-clear" onClick={handleClear}>Clear Leaderboard</button>
    </div>
  );
}
