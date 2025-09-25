import React, { useState, useEffect } from 'react';
import categories from '../data/categories.js';
import Card from '../components/Card.jsx';

export default function Home() {
  const [name, setName] = useState(localStorage.getItem('player_name') || '');
  const [showPrompt, setShowPrompt] = useState(!name);
  const [sessionSize, setSessionSize] = useState(Number(localStorage.getItem('session_size') || 20));
  const [deferredPrompt, setDeferredPrompt] = useState(null); // Android PWA prompt

  // Detect iOS Safari
  function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }

  // Check if already installed in standalone mode
  function isInStandaloneMode() {
    return ('standalone' in window.navigator) && window.navigator.standalone;
  }

  // Listen for the PWA beforeinstallprompt event (Android/Chrome)
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('player_name', name);
    setShowPrompt(false);
  }

  // Trigger the PWA install prompt
  function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  }

  return (
    <main className="home">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="add-user-btn"
            onClick={() => setShowPrompt(true)}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              background: '#1dd17d',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {name ? 'Change Name' : 'Add User'}
          </button>

          {/* Android Chrome → Install button */}
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
          <label style={{ fontWeight: 700 }}>Session:</label>
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

      {showPrompt && (
        <form className="name-input-form" onSubmit={handleSave} style={{ margin: '24px 0' }}>
          <input
            className="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name to play"
            maxLength={18}
            required
            style={{
              padding: '8px',
              borderRadius: 8,
              border: '1px solid #ccc',
              marginRight: 8
            }}
          />
          <button
            type="submit"
            className="save-btn"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: '#1dd17d',
              color: '#fff',
              border: 'none',
              fontWeight: 700
            }}
          >
            Save
          </button>
        </form>
      )}

      <h5 className="title">Quiz Game 🎯</h5>
      <p className="title">Choose a category to start</p>

      <div className="grid">
        {categories.map((c) => (
          <Card key={c.id} category={c} />
        ))}
      </div>
    </main>
  );
}
