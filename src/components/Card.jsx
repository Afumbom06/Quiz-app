import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Card({ category }) {
  const navigate = useNavigate();
  return (
    <button
      className="card"
      onClick={() => navigate(`/category/${category.id}`)}
      style={{ background: `linear-gradient(135deg, ${category.colorStart}, ${category.colorEnd})` }}
      aria-label={`Open ${category.name}`}
    >
      <div className="card-emoji">{category.icon}</div>
      <div className="card-title">{category.name}</div>
    </button>
  );
}
