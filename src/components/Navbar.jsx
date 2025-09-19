import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-left">
        <button className="menu-btn" aria-label="menu">💇‍♀️</button>
        <Link to="/" className="logo">QuizTime</Link>
      </div>
      <div className="nav-right">
        <div className="coins">💎 345</div>
      </div>
    </header>
  );
}
