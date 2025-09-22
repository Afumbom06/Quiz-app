import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <header className="navbar">
      <div className="nav-left">
        <button className="menu-btn" aria-label="menu">💇‍♀️</button>
        <Link to="/" className="logo">QuizTime</Link>
      </div>
      <div className="nav-right">
        <Link to="/leaderboard" className="nav-icon-btn" title="Leaderboard" aria-label="Leaderboard">
          <span role="img" aria-label="Leaderboard">🏆</span>
        </Link>
        <Link to="/practice" className="nav-icon-btn" title="Practice" aria-label="Practice">
          <span role="img" aria-label="Practice">📝</span>
        </Link>
        <div className="coins">💎 345</div>
        <button
          className="theme-toggle"
          aria-label="toggle theme"
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}
