import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Category from './pages/Category.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Practice from './pages/Practice.jsx';

export default function App() {
  return (
    <div className="app-root">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:id" element={<Category />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/practice" element={<Practice />} />
      </Routes>
    </div>
  );
}
