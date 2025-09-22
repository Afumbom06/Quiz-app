import React from 'react';
import { useNavigate } from 'react-router-dom';
import { buildSessionQuestions } from '../utils/questionPool.js';
import questionsDB from '../data/questions.js';

export default function Card({ category }) {
  const navigate = useNavigate();
  // Try to resume session or start new
  function handleClick() {
    const sessionKey = `quiz_session_${category.id}`;
    let session = JSON.parse(localStorage.getItem(sessionKey) || 'null');
    if (!session || !Array.isArray(session.questions) || !session.questions.length) {
      // Build new session and store
      const allQs = questionsDB[category.id] || [];
      const sessionSize = Number(localStorage.getItem('session_size') || 20);
      const questions = buildSessionQuestions(allQs, { sessionSize });
      session = { questions, index: 0, score: 0, sessionSize };
      localStorage.setItem(sessionKey, JSON.stringify(session));
    }
    navigate(`/category/${category.id}`);
  }
  return (
    <button
      className="card"
      onClick={handleClick}
      style={{ background: `linear-gradient(135deg, ${category.colorStart}, ${category.colorEnd})` }}
      aria-label={`Open ${category.name}`}
    >
      <div className="card-emoji">{category.icon}</div>
      <div className="card-title">{category.name}</div>
    </button>
  );
}
