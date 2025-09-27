// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import categories from '../data/categories.js';
import Card from '../components/Card.jsx';
import { supabase } from '../utils/supabaseClient';
import { addOrUpdateScore } from '../utils/leaderboard';

export default function Home() {
  const [sessionSize, setSessionSize] = useState(Number(localStorage.getItem('session_size') || 20));
  const [currentUser, setCurrentUser] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Detect iOS Safari
  const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isInStandaloneMode = () => ('standalone' in window.navigator) && window.navigator.standalone;

  // Get logged-in user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error(error);
      else setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  // Save score for current user (no name prompt)
  const handleSaveScore = async (score) => {
    if (!currentUser) {
      alert("Please log in to save your score!");
      return;
    }
    await addOrUpdateScore(score);
  };

  return (
    <main className="home" style={{ backgroundColor: "#0e1624", minHeight: '100vh', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Android Install button */}
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                background: '#1d8df1',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Install App
            </button>
          )}

          {/* iOS Safari → Guide message */}
          {isIos() && !isInStandaloneMode() && (
            <div
              style={{
                background: '#fffae6',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: '14px',
                maxWidth: '200px'
              }}
            >
              📲 On iPhone: Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> to install.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontWeight: 700, color: '#fff' }}>Session:</label>
          <select
            value={sessionSize}
            onChange={(e) => {
              setSessionSize(Number(e.target.value));
              localStorage.setItem('session_size', e.target.value);
            }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <h1 style={{ color: '#1dd17d', textAlign: 'center', marginBottom: 8 }}>🎯 Quiz Game</h1>
      <p style={{ color: '#fff', textAlign: 'center', marginBottom: 24 }}>Choose a category to start</p>

      <div className="grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {categories.map((c) => (
          <Card
            key={c.id}
            category={c}
            currentUser={currentUser}
            onScore={(score) => handleSaveScore(score)} // save score automatically
          />
        ))}
      </div>
    </main>
  );
}
