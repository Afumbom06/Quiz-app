// src/pages/Practice.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import categories from '../data/categories.js';



export default function Practice() {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState('');
  const [difficulty, setDifficulty] = useState('easy');

  const startPractice = () => {
    if (!selectedCat) return;
    // Redirect to questions page for selected category
    navigate(`/category/${selectedCat}`);
  };

  return (
    <div className="practice-setup">
      <h2>Practice Mode</h2>
      <label>
        Category:
        <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
          <option value="">Select...</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </label>
      <label>
        Difficulty:
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <button onClick={startPractice} disabled={!selectedCat}>Start Practice</button>
    </div>
  );
}
