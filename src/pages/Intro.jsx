import React from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/quiz_logo.png";
import "./Intro.css"; // Import regular CSS

export default function Intro() {
  const navigate = useNavigate();

  return (
    <div className="intro-page">
      {/* Subtitle */}
      <h2 className="intro-subtitle">Welcome to 🎉</h2>

      {/* Title replaced with Logo */}
      <img src={logoImg} alt="Quizly Logo" className="intro-logo" />

      {/* Description */}
      <p className="intro-text">
        Test your knowledge, challenge yourself, and climb the leaderboard!
      </p>

      {/* Buttons */}
      <div className="intro-buttons">
        <button
          className="intro-btn start"
          onClick={() => navigate("/home")}
        >
          🧠 Start Game
        </button>

        <button
          className="intro-btn leaderboard"
          onClick={() => navigate("/leaderboard")}
        >
          🏆 Leaderboard
        </button>
      </div>
    </div>
  );
}
