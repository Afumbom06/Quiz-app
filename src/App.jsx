import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Intro from './pages/Intro.jsx';
import Home from './pages/Home.jsx';
import Category from './pages/Category.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Practice from './pages/Practice.jsx'; 

export default function App() {
  const location = useLocation();

  // Hide Navbar only on the landing/intro screen
  const hideNavbar = location.pathname === "/";

  return (
    <div className="app-root">
      {!hideNavbar && <Navbar />}  {/* Render Navbar only if not on landing */}

      <Routes>
        {/* Landing / Intro Screen */}
        <Route path="/" element={<Intro />} />

        {/* Main Game */}
        <Route path="/home" element={<Home />} />

        {/* Other Pages */}
        <Route path="/category/:id" element={<Category />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/practice" element={<Practice />} />
      </Routes>
    </div>
  );
}
