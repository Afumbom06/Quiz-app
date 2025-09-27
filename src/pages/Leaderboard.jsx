// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { getLeaderboard } from "../utils/leaderboard";

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUserAndScores = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user:", error.message);
      else setCurrentUser(user?.id || null);
      await fetchScores();
    };

    fetchCurrentUserAndScores();
    const handleFocus = () => fetchScores();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchScores = async () => {
    const data = await getLeaderboard();
    setScores(data);
  };

  const myScore = scores.filter(s => s.user_id === currentUser)
                        .sort((a,b)=>b.score-a.score)[0] || null;

  if (!scores.length) {
    return (
      <div style={containerStyle}>
        <div style={boxStyle}>
          <h2 style={titleStyle}>🏆 Global Leaderboard</h2>
          <p style={noScoresStyle}>No high scores yet. Play and claim your spot!</p>
        </div>
      </div>
    );
  }

  const highest = scores.reduce((a,b)=>a.score>b.score?a:b);
  const lowest = scores.reduce((a,b)=>a.score<b.score?a:b);

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <h2 style={titleStyle}>🏆 Global Leaderboard</h2>

        <div style={highLowContainer}>
          <div style={highlightCard("gold")}>
            🥇 {highest.name} – {highest.score} pts
          </div>
          <div style={highlightCard("red")}>
            😢 {lowest.name} – {lowest.score} pts
          </div>
        </div>

        <ol style={listStyle}>
          {scores.map((entry, idx) => {
            const isCurrentUser = entry.user_id === currentUser;
            return (
              <li key={entry.id} style={listItemStyle(isCurrentUser)}>
                <span style={rankStyle}>#{idx + 1}</span>
                <span style={nameStyle}>{entry.name}</span>
                <span style={scoreStyle}>{entry.score} pts</span>
                <span style={dateStyle}>
                  {entry.date ? new Date(entry.date).toLocaleDateString() : "—"}
                </span>
              </li>
            );
          })}
        </ol>

        {myScore && (
          <div style={myScoreStyle}>
            🌟 Your top score: {myScore.score} pts
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  minHeight: "100vh",
  padding: "24px",
  backgroundColor: "#0e1624",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "sans-serif",
};

const boxStyle = {
  width: "100%",
  maxWidth: 600,
  padding: 24,
  borderRadius: 16,
  backgroundColor: "#141d35",
  boxShadow: "0 0 20px rgba(0,0,0,0.5)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const titleStyle = {
  fontSize: "32px",
  marginBottom: "24px",
  textAlign: "center",
  color: "#1dd17d",
  textShadow: "0 0 10px #1dd17d, 0 0 20px #1dd17d",
};

const noScoresStyle = { textAlign: "center", fontSize: "18px", marginTop: 20 };

const highLowContainer = {
  display: "flex",
  gap: 20,
  marginBottom: 20,
  flexWrap: "wrap",
  justifyContent: "center",
};

const highlightCard = (color) => ({
  backgroundColor: "#0e1624",
  border: `2px solid ${color}`,
  borderRadius: 12,
  padding: "12px 24px",
  fontWeight: "700",
  fontSize: 18,
  color,
  textShadow: `0 0 6px ${color}`,
  transition: "all 0.3s ease-in-out",
  animation: "pulse 1.2s infinite",
});

const listStyle = {
  listStyle: "none",
  padding: 0,
  width: "100%",
};

const listItemStyle = (highlight) => ({
  display: "grid",
  gridTemplateColumns: "40px 1fr 80px 100px",
  gap: "12px",
  alignItems: "center",
  padding: "12px",
  borderRadius: "12px",
  marginBottom: "8px",
  backgroundColor: highlight ? "#1d8df1" : "#0e1624",
  color: "#fff",
  boxShadow: highlight ? "0 0 15px #1d8df1" : "0 0 5px #000",
  transform: highlight ? "scale(1.03)" : "scale(1)",
  transition: "all 0.3s ease",
});

const rankStyle = { fontWeight: "700" };
const nameStyle = { fontWeight: "500" };
const scoreStyle = { textAlign: "right", fontWeight: "600" };
const dateStyle = { textAlign: "right", fontSize: "12px", color: "#aaa" };

const myScoreStyle = {
  marginTop: 20,
  padding: "10px 20px",
  borderRadius: 12,
  backgroundColor: "#1dd17d",
  color: "#fff",
  fontWeight: "700",
  textShadow: "0 0 6px #1dd17d",
  animation: "pulse 1.2s infinite",
};

// Add this to your CSS for animation
/*
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
*/
