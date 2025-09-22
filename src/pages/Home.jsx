import React, { useState } from 'react';
import categories from '../data/categories.js';
import Card from '../components/Card.jsx';

export default function Home() {
  const [name, setName] = useState(localStorage.getItem('player_name') || '');
  const [showPrompt, setShowPrompt] = useState(!name);
  const [sessionSize, setSessionSize] = useState(Number(localStorage.getItem('session_size') || 20));

  function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem('player_name', name);
    setShowPrompt(false);
  }

  return (
    <main className="home">
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
        <button
          className="add-user-btn"
          onClick={() => setShowPrompt(true)}
          style={{padding:'8px 18px',borderRadius:8,background:'#1dd17d',color:'#fff',border:'none',fontWeight:700,cursor:'pointer'}}
        >
          {name ? 'Change Name' : 'Add User'}
        </button>
        <div style={{marginLeft:12,display:'flex',alignItems:'center',gap:8}}>
          <label style={{fontWeight:700}}>Session:</label>
          <select value={sessionSize} onChange={e => { setSessionSize(Number(e.target.value)); localStorage.setItem('session_size', e.target.value); }}>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      {showPrompt && (
        <form className="name-input-form" onSubmit={handleSave} style={{margin:'24px 0'}}>
          <input
            className="name-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name to play"
            maxLength={18}
            required
            style={{padding:'8px',borderRadius:8,border:'1px solid #ccc',marginRight:8}}
          />
          <button type="submit" className="save-btn" style={{padding:'8px 16px',borderRadius:8,background:'#1dd17d',color:'#fff',border:'none',fontWeight:700}}>Save</button>
        </form>
      )}
      <h5 className="title"> Quiz Game 🎯</h5> 
      <p className="title">Choose a category to start</p>
      <div className="grid">
        {categories.map((c) => (
          <Card key={c.id} category={c} />
        ))}
      </div>
    </main>
  );
}
