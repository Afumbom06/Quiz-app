import React from 'react';
import categories from '../data/categories.js';
import Card from '../components/Card.jsx';

export default function Home() {
  return (
    <main className="home">
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
